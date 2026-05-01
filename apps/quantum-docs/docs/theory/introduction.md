# 原理导览

这组文档解释 Quantum 的内部工作方式，重点回答三个问题：

1. Schema 如何被 Core 转成可运行的页面实例。
2. 编辑器如何维护状态，并把增删改查同步到画布。
3. 运行时、Sandbox、DataSource 如何协作完成所见即所得和数据驱动更新。

## 架构分层

```text
应用层
├── apps/playground        编辑器演示应用
└── apps/quantum-docs      文档站点

编辑层
├── packages/editor        可视化编辑器 UI 和服务
└── packages/sandbox       iframe 画布、选中、拖拽、通信

运行层
├── runtime/vue2-active    Vue2 运行时
└── runtime/vue3-active    Vue3 运行时

核心层
├── packages/core          LowCodeRoot/Page/Node
├── packages/data-source   数据源与依赖触发
├── packages/schemas       Schema 类型和常量
└── packages/utils         树操作、发布订阅、样式转换等工具
```

## 核心数据流

```text
用户操作
  -> EditorService 更新 Schema
  -> Sandbox 通知 iframe runtime
  -> Runtime 递归渲染组件
  -> Core 编译节点属性、事件和条件
  -> DataSource 收集依赖并在数据变化时触发更新
```

## 推荐阅读顺序

- [核心模型](./core.md)：先理解 `LowCodeRoot`、`LowCodePage`、`LowCodeNode` 的职责。
- [编辑器](./editor.md)：再看编辑器如何组织服务、状态和操作入口。
- [画布](./sandbox.md)：理解 iframe、蒙层、拖拽和坐标换算。
- [数据源](./data-source.md)：理解数据绑定、依赖收集和触发更新。

## 和 API 文档的关系

API 文档描述“字段怎么写”，原理文档描述“字段为什么这样生效”。如果只是写 Schema，优先看 [低代码 Schema 协议](/api/schema/)。如果要改编辑器、画布、运行时或数据源实现，再回到本组文档。
