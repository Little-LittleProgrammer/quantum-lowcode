# 基础概念
通过讲述一些基础概念, 帮助开发者了解`Quantum`是如何运行的

## 名词概念

### Quantum
是本低代码搭建平台的别称: 量子低代码搭建平台

### runtime 运行时
我们把最终要渲染的页面统一称为 `runtime`、runtime是承载 `Quantum` 项目页面的运行环境. runtime 分为工作区与真实项目: 
- 工作区是 `runtime` 的一个具体实例, 模拟器, 可实现实时的渲染
- 真实项目 是发布上线后, 用户访问的真实项目页面  
包含: `runtime-vue2`, `runtime-vue3`

### 渲染器
渲染器是 `Quantum` 平台的核心, 负责将 `lowcodeSchemas` 转换为真实的页面, 并将页面渲染到 `runtime` 中.  
即 `runtime/render-vue2-active/src`目录下内容

### 引擎
引擎是 `Quantum` 低代码平台的核心, 主要提供编辑器与运行时的通讯, 数据节点的管理, schemas的配置, 联动功能 以及 拖拽功能  
包含: `core`, `editor`, `data`, `sandbox`, `ui`, `schemas`

### 组件
组件是 Quantum 可配置页面元素的最小单位.

### 容器
容器是 Quantum 可配置页面元素的一个基础单位, 页面本省就是一个容器, 容器中可以配置容器与组件,所以容器理论上可以无限嵌套。

### 页面
页面是 Quantum 作为一个可视化编辑器经过配置后，最终得到的呈现结果. 搭建后的页面会被发布上线, 供用户访问

### DSL
lowcodeSchemas 是编辑器搭建页面的最终产物, 其中包含了所有的信息(组件, 页面, 公共事件, 数据等等), 所有的操作行为都会映射到schemas上, 格式: [schemas](../../api/schema/index.md)

### 画布
画布就是承载运行时的容器