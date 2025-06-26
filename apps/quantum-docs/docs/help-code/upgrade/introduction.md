# 介绍

## 目录结构
```
├── apps
│   ├── playground                    // 低代码编辑器演示应用
│   └── quantum-docs                  // 文档站点
├── packages
│   ├── cli                          // 命令行工具（开发中）
│   ├── core                         // 核心库，对节点操作、全局事件、数据进行统一管理
│   ├── data-source                  // 数据源管理
│   ├── editor                       // 可视化编辑器
│   ├── sandbox                      // 沙箱画布，负责编辑器与运行时通信
│   ├── schemas                      // 低代码schema声明协议
│   ├── ui                          // Vue3组件库
│   ├── ui-vue2                     // Vue2组件库
│   └── utils                       // 工具库
├── runtime                         // 运行时
│   ├── vue2-active                 // Vue2运行时渲染器
│   └── vue3-active                 // Vue3运行时渲染器
└── package.json
```

## 架构设计

### 核心模块介绍

#### 1. Core（核心库）
- **功能**: 定义转换数据模型(schemas)、文件模型、数据绑定、渲染器、I/O
- **职责**: 
  - 数据模型管理
  - 组件props绑定方案
  - 事件系统管理
  - 数据源绑定方案

#### 2. Editor（编辑器）
- **功能**: 可视化编辑器模块，包括物料、画布、配置、拖拽节点
- **组件架构**:
  - **布局组件**: Framework(布局)、Workspace(工作区)、Sandbox(画布)
  - **Service Store**: 全局状态管理
    - EditorService: 关联core模块，实现节点的设置读取更新
    - UiService: 画布功能的样式管理
    - DataSourceService: 数据源管理
    - ComponentService: 组件管理
  - **Hooks**: Use-service等钩子函数

#### 3. Sandbox（沙箱画布）
- **功能**: 画布功能，负责编辑器与运行时通信
- **核心类**:
  - **BoxCore**: 负责统一对外接口，管理BoxRender、BoxMask、ActionManager
  - **BoxRender**: 基于iframe加载runtimeUrl，支持组件增删改查
  - **BoxMask**: 蒙层，隔绝鼠标事件，避免组件事件被触发
  - **ActionManager**: 监听鼠标键盘事件，实现单选、多选、高亮行为

#### 4. Data-Source（数据源）
- **功能**: 全局数据源和方法管理
- **特性**:
  - 支持base和http两种数据源类型
  - 数据绑定和依赖管理
  - 全局方法调用

#### 5. UI组件库
- **UI**: Vue3组件库，提供基础组件
- **UI-Vue2**: Vue2组件库，支持Vue2项目
- **特性**: 跨框架组件支持

#### 6. Runtime（运行时）
- **功能**: 进行时渲染，与低代码引擎完全脱离
- **特性**:
  - 通过sandbox画布传递schemas
  - 支持Vue2和Vue3两种运行时
  - 可视化页面所见即所得

## 原理介绍

### Schema解析渲染
通过载入保存的 `lowcodeSchema`配置，通过渲染器渲染页面。容器和组件在配置中呈树状结构，渲染器会递归配置，从而渲染出页面所有组件。

### 编辑器与Runtime通讯
本质上是通过发布订阅模式实现：
1. 将 `onRuntimeReady` 方法注入到 `window` 的 `quantum` 中
2. 初始化时订阅`runtime-ready`事件
3. 当`iframe`里的项目初始化完成时，触发`runtime-ready`事件
4. 获取`runtime`配置的事件，从而实现双向通讯

### 组件渲染流程
1. **Schema解析**: 解析lowcodeSchema配置
2. **组件注册**: 注册业务组件到运行时
3. **递归渲染**: 根据树状结构递归渲染组件
4. **事件绑定**: 绑定组件事件和数据源
5. **实时预览**: 通过沙箱实现实时预览效果

### 数据流转
```
编辑器操作 -> Schema更新 -> Sandbox通信 -> Runtime渲染 -> 页面更新
    ↑                                                      ↓
事件反馈 <- 组件交互 <- 用户操作 <- 页面展示 <- 组件渲染
```
