# 03-Editor编辑器状态流

## 先看编辑器真正管理的是什么

`packages/editor` 并不是一个“纯 UI 包”，它本质上是编辑态状态机。

其中最重要的是 `EditorService.state`，里面维护了：

- `root`
  - 当前整棵 Schema 树
- `page`
  - 当前编辑页面
- `node`
  - 当前主选中节点
- `nodes`
  - 当前多选节点列表
- `parent`
  - 当前选中节点的父节点
- `sandbox`
  - 当前画布实例 `BoxCore`
- `pageLength`
  - 页面数量

## 入口组件如何把这些服务串起来

`packages/editor/src/editor.vue` 做了三件事：

1. 组装布局组件
2. 初始化 service
3. 通过 `provide` 把 service 暴露给子组件

`useServicesInit` 则负责把外部 props 映射到内部状态，例如：

- `props.value -> editorService.root`
- `props.boxRect -> uiService.sandboxRect`
- `props.componentGroupList -> componentService.list`

这意味着外部应用传进来的 props，最终都会沉淀为 service 状态。

## 编辑器里的“增删改查”本质是什么

### 新增节点

`EditorService.add` 的核心动作：

1. 生成要新增的节点配置
2. 找到父节点
3. 把节点插入 `root` 配置树
4. 调 `sandbox.add` 同步给 iframe
5. 修正初始位置
6. 更新选中状态和历史记录

这里最重要的点是：

编辑器先改自己的 Schema，再通知 runtime 补齐渲染，不是反过来。

### 更新节点

`EditorService.update` 会：

1. 根据 `field` 找到原节点
2. 合并配置
3. 处理布局切换、副作用字段
4. 回写到 `root`
5. 调 `sandbox.update`
6. 推入历史记录

### 删除节点

`EditorService.delete` 会：

1. 从 `root` 里删掉节点
2. 调 `sandbox.delete`
3. 重新计算默认选中项
4. 更新历史记录

所以编辑器和画布始终保持“配置树 + iframe 视图”的双写同步。

## 为什么说 `EditorService` 是真正的编辑入口

因为几乎所有编辑操作最终都要收束到这里：

- 组件面板拖入
- 图层面板点击
- 属性面板修改
- 右键菜单操作
- 撤销重做
- 复制粘贴

如果你在做需求时找不到入口，大概率先找 `EditorService`。

## 历史记录怎么做

`HistoryService` 是按页面维度存历史的。

核心做法是：

- 每个页面对应一个 `UndoRedo<StepValue>`
- `StepValue` 里不仅存页面数据，还存 `modifiedNodeFields` 和当前选中节点

这样撤销重做不会只恢复“页面树”，还会尽量恢复编辑上下文。

这个设计是合理的，因为低代码编辑器里“当前选中了谁”本身就是编辑体验的一部分。

## 属性面板为什么能动态变化

项目没有把属性面板写死，而是走组件元数据驱动。

例如 `packages/ui/src/config.ts` 暴露了：

- `formSchemas`
- `events`

每个组件的 `formSchema.ts` 定义这个组件有哪些可配置项、用什么表单组件渲染、有什么默认值。

所以属性面板不是静态写的，而是“读取组件元数据后动态生成”。

## 组件面板和属性面板为什么是分开的

这是项目一个很重要的分层：

- `componentService`
  - 管左侧“能拖哪些组件”
- `propsService`
  - 管右侧“当前组件有哪些可编辑配置”

这样业务方扩展时，可以分别定制：

- 可新增组件集合
- 每个组件的配置表单

## 编辑器这一层最容易踩的坑

### 1. 只改了 iframe，没改 `root`

这样刷新或重新选中后，状态会回滚。

### 2. 只改了 `root`，没同步 sandbox

这样数据是对的，但画布不会立即反映。

### 3. 更新时没保住 `field`

一旦 `field` 变了，选中、定位、事件命名空间都会跟着失效。

## 新人第一次改编辑器需求的推荐入口

### 需求属于结构操作

先看 `EditorService`

### 需求属于画布交互

先看 `packages/editor/src/components/layouts/sandbox/index.vue`

### 需求属于表单配置

先看 `packages/ui/src/**/formSchema.ts` 和 `propsService`
