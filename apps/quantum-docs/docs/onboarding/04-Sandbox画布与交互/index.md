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

### 先分清 4 套坐标系

读这层代码时，先不要急着看分支，先把坐标系拆开：

1. 浏览器视口坐标
   - 来自鼠标事件的 `clientX / clientY`
2. sandbox 可视坐标
   - 鼠标点减去 `boxContainer.getBoundingClientRect()` 后的局部坐标
3. runtime 页面坐标
   - 把 zoom 影响剥离、把滚动补回去后，落到 iframe 页面里的真实位置
4. Schema 设计稿坐标
   - 通过 `designWidth` 换算后，最终写进节点 `style.left / style.top` 的值

只有这 4 层分开了，后面“为什么这里要加 scroll”“为什么那里要除 zoom”才会变得直观。

### 新增组件时的完整公式

`packages/editor/src/components/layouts/sandbox/index.vue` 的 `dropHandler`
可以拆成下面这条链：

```text
visibleLeft = e.clientX - containerRect.left
visibleTop  = e.clientY - containerRect.top
```

如果当前页面是绝对布局，还要把滚动补回去：

```text
pageLeft = visibleLeft + scrollLeft
pageTop  = visibleTop + scrollTop
```

然后把“当前渲染像素”转成“设计稿坐标”：

```text
designLeft = pageLeft * designWidth / pageRenderedWidth
designTop  = pageTop * designWidth / pageRenderedWidth
```

这里的 `pageRenderedWidth` 不是静态配置，而是 `calcValueByDesignWidth`
里实时读取的 `doc.documentElement` 计算宽度。

最后还要把编辑器壳层的缩放还原掉：

```text
schemaLeft = designLeft / zoom
schemaTop  = designTop / zoom
```

原因是外层 `q-sandbox-container` 做了 `transform: scale(zoom)`。
用户肉眼看到的 80px 位移，在 `zoom = 0.8` 时，实际对应的页面位移应该是 100px。

### 为什么绝对布局还要减父容器 offset

当拖入命中了一个容器时，新增节点的坐标不能继续是“相对整页”，而必须变成“相对父容器”。

代码里的处理顺序是：

1. 用 `js_utils_dom_offset(parentEl)` 拿到父容器在页面中的绝对位置
2. 用 `calcValueByDesignWidth` 把这个 offset 转到设计稿尺度
3. 因为前面的鼠标坐标仍然处在 zoom 后的可视空间里，所以先乘回 `zoom`
4. 在最终统一除以 `zoom` 之后，得到相对父容器的 Schema 坐标

少了这一步，就会出现典型问题：

- 组件看起来拖进了容器
- 但保存的 `left / top` 仍然像是相对整个页面
- 重新渲染后位置会偏到容器外

### 命中元素为什么也要除 zoom

`packages/sandbox/src/box-render.ts` 的 `getElementsFromPoint` 也在做同类换算。

它的逻辑是：

1. 先拿浏览器里的 `clientX / clientY`
2. 减去 iframe 自己的 `rect.left / rect.top`
3. 再把结果除以 `this.zoom`
4. 最后调用 iframe 文档的 `elementsFromPoint`

公式可以直接记成：

```text
iframeInnerX = (clientX - iframeRect.left) / zoom
iframeInnerY = (clientY - iframeRect.top) / zoom
```

原因是：

- 鼠标事件发生在编辑器外层页面
- 真实 DOM 命中发生在 iframe 内部文档
- iframe 被外层整体缩放后，视觉上的 1px 已经不等于内部 DOM 的 1px

如果这里漏掉 `/ zoom`，最常见的现象就是鼠标指到 A，实际命中 B，而且 zoom 越小偏差越大。

### 遮罩层为什么要反向平移

`packages/sandbox/src/box-mask.ts` 不直接逐个改选中框坐标，而是在滚动时统一做：

```text
transform: translate3d(-scrollLeft, -scrollTop, 0)
```

原因是 mask 盖在 iframe 上方，它必须和页面滚动保持相反位移，视觉上才能继续盖住同一批元素。

可以把它理解成：

- 页面内容向下滚了 120px
- mask 要整体向上平移 120px
- 这样选中框、辅助线、高亮框仍然会对齐真实组件

固定定位模式又是个例外：

- `Mode.FIXED` 下元素本来就相对视口
- mask 不应该再跟页面滚动一起跑
- 所以 `BoxMask.scroll()` 里会把 fixed 模式的 `scrollLeft / scrollTop` 归零

### 拖拽结束后为什么回写坐标还要再算一次

新增组件是一次坐标换算，拖拽/缩放结束后的持久化又是另一轮换算。

`packages/sandbox/src/box-drag-resize-helper.ts` 的 `getUpdatedElRect`
会在操作完成后重新读取真实 DOM：

- 普通模式读 `el.offsetLeft / el.offsetTop`
- 再用 `calcValueByDesignWidth` 转成设计稿坐标
- 绝对定位下如果存在 shadow 元素，还要把 `translate` 和父容器 offset 一起算进去
- margin、border 也会参与最终尺寸和位置修正

所以 sandbox 的坐标逻辑不是“拖入时算一次就结束”，而是：

1. 落点前算一次
2. 编辑过程中 Moveable 用一套临时视觉坐标
3. 提交回 Schema 时再从真实 DOM 反推一次标准值

### 排查坐标问题时按变量链路看

遇到坐标错位，不要先猜 Vue 或 Moveable 有问题，先把下面几个量逐个打出来：

1. `e.clientX / e.clientY`
   - 鼠标原始输入是否正确
2. `containerRect.left / top`
   - 当前减掉的是不是正确的 sandbox 容器
3. `sandbox.mask.scrollLeft / scrollTop`
   - absolute 页面是否把滚动补回去了
4. `zoom`
   - 是否既参与了视觉缩放，又在公式里被正确抵消
5. `designWidth`
   - 当前页面设计稿宽度是否和 runtime 基准一致
6. `parentLeft / parentTop`
   - 命中容器时是否正确扣掉了父容器偏移

只要这几个量是对的，绝大多数“拖入位置不对”“框选错位”“命中元素偏移”的问题都能快速归类。

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
