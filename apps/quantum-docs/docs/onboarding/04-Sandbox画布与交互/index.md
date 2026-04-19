# 04-Sandbox画布与交互

## Sandbox 的真实职责

很多人第一次看这个仓库，会把 `sandbox` 当成 runtime。实际上它不是。

`packages/sandbox` 的职责是：

- 挂载 iframe
- 建立编辑器和 runtime 的通信桥
- 维护选中框、蒙层、辅助线、高亮
- 承接拖拽、缩放、多选、吸附等交互

它是“编辑态交互层”，不是业务页面执行层。

## `BoxCore` 是对外总控

`BoxCore` 统一管理三个子模块：

- `BoxRender`
  - iframe 渲染和 runtime 桥接
- `BoxMask`
  - 蒙层、遮罩、选中框、参考线
- `ActionManager`
  - 鼠标键盘交互、拖拽缩放、多选、高亮

所以理解 sandbox，最好的办法不是从 UI 看，而是从这三个模块的职责边界看。

## iframe 为什么是必须的

项目用 iframe 不是为了炫技，而是为了做隔离。

它至少解决了 4 个问题：

1. 编辑器样式不会污染业务页面
2. 业务组件事件不会直接打到编辑器壳层
3. 不同 runtime 可以独立演进
4. 选中、高亮、拖拽可以在蒙层上做，不必入侵业务组件内部

这也是该项目能够同时支持 Vue2 / Vue3 runtime 的基础之一。

## 编辑器和 runtime 怎么握手

握手流程在 `BoxRender` 和 runtime playground App 里最清楚：

1. `BoxRender.mount` 创建 iframe
2. 给 iframe 的 `window` 注入 `window.quantum`
3. runtime 启动后调用 `window.quantum.onRuntimeReady(...)`
4. runtime 把自己的能力暴露出来

暴露的核心接口包括：

- `getApp`
- `updateRootConfig`
- `updatePageField`
- `select`
- `add`
- `update`
- `delete`

这套接口非常关键，它定义了“编辑态如何驱动运行态”。

## 为什么还要有 `BoxMask`

因为编辑器需要处理的是“编辑交互”，而不是“真实点击组件”。

例如：

- 选中一个按钮时，你不希望触发按钮业务点击逻辑
- 拖拽一个元素时，你要拖的是它的编辑框，不是组件自己的鼠标事件
- 多选、辅助线、容器高亮这些能力，业务组件本身并不具备

所以项目在 iframe 上方放了一层 mask，把编辑交互拦截出来单独处理。

## `ActionManager` 为什么复杂

因为它要解决的是低代码编辑器里最麻烦的一类问题：编辑坐标系和业务 DOM 坐标系的同步。

它要同时处理：

- 单选
- 多选
- 高亮
- 拖拽
- 缩放
- 旋转
- 键盘辅助
- 容器悬停高亮

这类逻辑天然比普通页面交互复杂。

## 坐标换算是这一层的核心难点

项目存储的是设计稿坐标，但用户操作的是当前画布像素。

所以拖入新组件时会发生一系列换算：

1. 取鼠标在 sandbox 里的可视坐标
2. 加上滚动偏移
3. 根据设计稿宽度换算成 Schema 存储值
4. 再根据父容器布局修正相对位置

这就是 `packages/editor/src/components/layouts/sandbox/index.vue` 中那段坐标计算代码存在的根本原因。

## 为什么选中态有两份

你会看到选中相关状态分散在两边：

- `EditorService`
  - 关心“当前业务上选中了哪个节点”
- `Sandbox / ActionManager`
  - 关心“当前 DOM 层选中了哪个元素”

这不是重复，而是两个不同层次：

- 一个是数据层选中
- 一个是交互层选中

两者需要同步，但不能混为一谈。

## Sandbox 这层的典型问题怎么查

### 现象 1：节点明明存在，但选不中

优先检查：

- DOM 是否有对应 `id`
- `getTargetElement` 是否能查到元素
- mask 是否已挂载
- 是否被别的元素挡住

### 现象 2：拖拽后位置不对

优先检查：

- 当前父布局是 `relative / absolute / fixed` 哪种
- `designWidth` 是否一致
- 当前 zoom 是否参与了换算

### 现象 3：iframe 里页面显示对了，但编辑器框选错位

优先检查：

- `onPageElUpdate` 是否正确触发
- page 元素尺寸是否已同步给 mask
- zoom 和 scrollTop/scrollLeft 是否同时参与了计算

## 对新人最重要的结论

遇到画布问题时，不要直接去怀疑 Vue 渲染，先判断它属于下面哪一类：

1. Schema 不对
2. runtime 没同步
3. iframe DOM 对了，但 mask/Moveable 没对齐

第三类问题才是 sandbox 自己的问题。
