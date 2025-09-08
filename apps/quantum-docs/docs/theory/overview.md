# Quantum 低代码平台总览

## 概述

Quantum 是一个面向企业级应用的可视化低代码搭建平台，旨在通过拖拽式组件编排和配置化开发，大幅提升前端开发效率。平台采用现代化的技术栈和工程架构，支持多种前端框架，提供了完整的从设计到发布的解决方案。

### 🎯 设计理念

- **可视化优先**：通过拖拽、配置实现大部分开发需求
- **代码友好**：支持可视化与代码开发的无缝切换
- **组件化**：基于组件的可复用设计理念
- **数据驱动**：强大的数据绑定和响应式更新机制
- **多框架支持**：同时支持 Vue2 和 Vue3 运行时
- **企业级**：满足复杂业务场景和大型项目需求

## 🏗️ 整体架构

### 分层架构图

```mermaid
graph TB
    subgraph "应用层 (Application Layer)"
        APP1[Playground 演示应用]
        APP2[Quantum Docs 文档站点]
        APP3[自定义业务应用]
    end
    
    subgraph "编辑器层 (Editor Layer)"
        EDITOR[编辑器 Editor]
        SANDBOX[沙箱 Sandbox]
        UI_LIB[组件库 UI/UI-Vue2]
        DS[数据源 Data-Source]
    end
    
    subgraph "核心层 (Core Layer)"
        CORE[核心库 Core]
        SCHEMA[协议 Schemas]
        UTILS[工具库 Utils]
    end
    
    subgraph "运行时层 (Runtime Layer)"
        RT_VUE2[Vue2 Runtime]
        RT_VUE3[Vue3 Runtime]
    end
    
    subgraph "基础设施层 (Infrastructure)"
        CLI[命令行工具 CLI]
        BUILD[构建工具链]
        DEV[开发工具]
    end
    
    APP1 --> EDITOR
    APP2 --> EDITOR
    APP3 --> EDITOR
    
    EDITOR --> SANDBOX
    EDITOR --> UI_LIB
    EDITOR --> DS
    
    SANDBOX --> RT_VUE2
    SANDBOX --> RT_VUE3
    
    DS --> CORE
    UI_LIB --> CORE
    RT_VUE2 --> CORE
    RT_VUE3 --> CORE
    
    CORE --> SCHEMA
    CORE --> UTILS
    
    EDITOR --> CLI
    CLI --> BUILD
    BUILD --> DEV
    
    style EDITOR fill:#e1f5fe
    style CORE fill:#f3e5f5
    style RT_VUE2 fill:#e8f5e8
    style RT_VUE3 fill:#e8f5e8
    style SANDBOX fill:#fff3e0
```

### 模块间交互关系

```mermaid
graph LR
    subgraph "编辑器环境"
        USER[用户操作] --> EDITOR[编辑器]
        EDITOR --> SANDBOX[沙箱画布]
        EDITOR --> SERVICES[编辑器服务]
    end
    
    subgraph "运行时环境"
        SANDBOX --> |iframe通信| RUNTIME[运行时]
        RUNTIME --> CORE[核心库]
        CORE --> COMPONENTS[组件渲染]
    end
    
    subgraph "数据流"
        SERVICES --> DS_MANAGER[数据源管理器]
        DS_MANAGER --> |响应式更新| CORE
        CORE --> |事件驱动| RUNTIME
    end
    
    subgraph "配置管理"
        EDITOR --> SCHEMA[Schema配置]
        SCHEMA --> |序列化| STORAGE[持久化存储]
        STORAGE --> |反序列化| RUNTIME
    end
    
    style EDITOR fill:#e3f2fd
    style RUNTIME fill:#f1f8e9
    style CORE fill:#fce4ec
    style SCHEMA fill:#fff8e1
```

## 📦 核心模块详解

### 1. Core（核心库）

**位置：** `packages/core/`  
**职责：** 数据模型管理、事件系统、运行时架构的核心实现

#### 核心功能
- **LowCodeRoot**：应用根实例，管理全局配置和生命周期
- **LowCodePage**：页面实例，管理页面级别的节点和数据
- **LowCodeNode**：节点实例，管理单个组件的配置和状态
- **Env**：环境检测，识别设备类型和浏览器环境
- **Flexible**：移动端适配，处理响应式布局和单位转换

#### 关键特性
- 🎯 **数据绑定系统**：支持强大的模板表达式 `${dataSource.field}`
- 🎪 **事件系统**：统一的事件总线，支持组件间通信
- 🎨 **样式转换**：自动处理 rem 单位转换和响应式适配
- 🎮 **生命周期管理**：完整的组件创建、挂载、销毁流程
- 🎵 **条件渲染**：复杂的条件显示逻辑支持

```typescript
// 使用示例
import { LowCodeRoot } from '@quantum-lowcode/core';

const app = new LowCodeRoot({
  config: schemas,
  platform: 'mobile',
  designWidth: 375
});

app.registerComponent('Button', ButtonComponent);
app.setPage('homePage');
```

### 2. Editor（编辑器）

**位置：** `packages/editor/`  
**职责：** 提供完整的可视化编辑器界面和功能

#### 架构组成

```mermaid
graph TB
    subgraph "编辑器架构"
        EDITOR_ROOT[Editor 根组件]
        
        subgraph "布局组件"
            FRAMEWORK[Framework 布局框架]
            WORKSPACE[Workspace 工作区]
            SIDEBAR[Sidebar 侧边栏]
            PROPS_PANEL[Props Panel 属性面板]
        end
        
        subgraph "服务层 (Services)"
            EDITOR_SERVICE[EditorService 编辑器服务]
            UI_SERVICE[UiService 界面服务]
            DS_SERVICE[DataSourceService 数据源服务]
            COMP_SERVICE[ComponentService 组件服务]
            PROPS_SERVICE[PropsService 属性服务]
            HISTORY_SERVICE[HistoryService 历史服务]
        end
        
        subgraph "钩子函数"
            USE_SERVICE[useService 服务钩子]
            USE_BOX[useBox 沙箱钩子]
        end
    end
    
    EDITOR_ROOT --> FRAMEWORK
    FRAMEWORK --> WORKSPACE
    FRAMEWORK --> SIDEBAR
    FRAMEWORK --> PROPS_PANEL
    
    EDITOR_ROOT --> EDITOR_SERVICE
    EDITOR_SERVICE --> UI_SERVICE
    EDITOR_SERVICE --> DS_SERVICE
    EDITOR_SERVICE --> COMP_SERVICE
    EDITOR_SERVICE --> PROPS_SERVICE
    EDITOR_SERVICE --> HISTORY_SERVICE
    
    WORKSPACE --> USE_SERVICE
    SIDEBAR --> USE_SERVICE
    PROPS_PANEL --> USE_SERVICE
    
    USE_SERVICE --> USE_BOX
```

#### 核心服务详解

**EditorService（编辑器核心服务）**
- 管理编辑器状态（选中节点、页面、根配置等）
- 提供节点增删改查操作
- 协调各个子服务的工作

**UiService（界面服务）**
- 管理编辑器界面状态（面板显示/隐藏、布局尺寸等）
- 控制工作区的视觉反馈
- 处理界面主题和样式配置

**DataSourceService（数据源服务）**
- 管理数据源的创建、编辑、删除
- 处理数据源与组件的绑定关系
- 提供数据预览和调试功能

**ComponentService（组件服务）**
- 管理可用组件列表
- 处理组件的注册和配置
- 提供组件拖拽和实例化功能

### 3. Sandbox（沙箱画布）

**位置：** `packages/sandbox/`  
**职责：** 在编辑器中渲染和操作组件，提供拖拽、选中、高亮等交互功能

#### 核心架构

```mermaid
graph TB
    subgraph "Sandbox 沙箱系统"
        BOXCORE[BoxCore 核心管理器]
        
        subgraph "渲染层"
            BOXRENDER[BoxRender 渲染引擎]
            IFRAME[iframe 运行时容器]
        end
        
        subgraph "交互层"
            BOXMASK[BoxMask 蒙层管理]
            ACTION_MANAGER[ActionManager 操作管理器]
        end
        
        subgraph "操作系统"
            DRAG_SINGLE[BoxDragResize 单选拖拽]
            DRAG_MULTI[BoxMultiDragResize 多选拖拽]
            HIGHLIGHT[BoxHighlight 高亮系统]
        end
        
        subgraph "辅助系统"
            TARGET_SHADOW[TargetShadow 影子节点]
            DRAG_HELPER[DragResizeHelper 拖拽助手]
            MOVEABLE[Moveable 拖拽库集成]
        end
    end
    
    BOXCORE --> BOXRENDER
    BOXCORE --> BOXMASK
    BOXCORE --> ACTION_MANAGER
    
    BOXRENDER --> IFRAME
    
    ACTION_MANAGER --> DRAG_SINGLE
    ACTION_MANAGER --> DRAG_MULTI
    ACTION_MANAGER --> HIGHLIGHT
    
    DRAG_SINGLE --> TARGET_SHADOW
    DRAG_MULTI --> TARGET_SHADOW
    HIGHLIGHT --> TARGET_SHADOW
    
    TARGET_SHADOW --> DRAG_HELPER
    DRAG_HELPER --> MOVEABLE
```

#### 关键机制

**事件隔离机制**
- 通过透明蒙层拦截所有鼠标事件
- 防止组件原生事件被触发
- 提供统一的交互入口

**坐标转换系统**
- 将蒙层坐标转换为 iframe 内坐标
- 处理缩放、滚动等变换
- 确保交互精度

**影子节点同步**
- 在蒙层上创建与目标组件同步的影子节点
- 实时同步位置、大小、样式
- 支持拖拽预览和视觉反馈

### 4. Runtime（运行时）

**位置：** `runtime/vue2-active/` 和 `runtime/vue3-active/`  
**职责：** 在 iframe 中渲染实际的低代码应用

#### 运行时架构

```mermaid
graph TB
    subgraph "Vue3 Runtime"
        VUE3_APP[Vue3 App]
        VUE3_MAIN[Vue3 Main]
        VUE3_CORE[Core Integration]
        VUE3_COMPS[Vue3 Components]
    end
    
    subgraph "Vue2 Runtime"
        VUE2_APP[Vue2 App]
        VUE2_MAIN[Vue2 Main]
        VUE2_CORE[Core Integration]
        VUE2_COMPS[Vue2 Components]
    end
    
    subgraph "共享核心"
        QUANTUM_CORE[Quantum Core]
        SCHEMA_CONFIG[Schema 配置]
        DATA_BINDING[数据绑定]
        EVENT_SYSTEM[事件系统]
    end
    
    subgraph "Sandbox 通信"
        IFRAME_API[iframe API]
        MESSAGE_BRIDGE[消息桥接]
        LIFECYCLE_HOOKS[生命周期钩子]
    end
    
    VUE3_APP --> VUE3_CORE
    VUE2_APP --> VUE2_CORE
    
    VUE3_CORE --> QUANTUM_CORE
    VUE2_CORE --> QUANTUM_CORE
    
    QUANTUM_CORE --> SCHEMA_CONFIG
    QUANTUM_CORE --> DATA_BINDING
    QUANTUM_CORE --> EVENT_SYSTEM
    
    VUE3_MAIN --> IFRAME_API
    VUE2_MAIN --> IFRAME_API
    IFRAME_API --> MESSAGE_BRIDGE
    MESSAGE_BRIDGE --> LIFECYCLE_HOOKS
```

#### 双运行时支持

**Vue3 Runtime**
- 基于 Vue 3.x 和 Composition API
- 使用 `@quantum-lowcode/ui` 组件库
- 支持最新的 Vue 特性和生态

**Vue2 Runtime**
- 基于 Vue 2.x 和 Options API
- 使用 `@quantum-lowcode/ui-vue2` 组件库
- 向后兼容已有的 Vue2 项目

### 5. Data-Source（数据源）

**位置：** `packages/data-source/`  
**职责：** 统一的数据源管理和响应式更新系统

#### 数据源类型

**BaseDataSource（基础数据源）**
- 本地状态管理
- 支持字段定义和默认值
- 提供数据操作方法

**HttpDataSource（HTTP数据源）**
- 网络请求数据源
- 支持 RESTful API
- 请求拦截器和响应处理
- 自动请求和手动触发

#### 响应式机制

```mermaid
graph LR
    subgraph "依赖收集"
        TEMPLATE[模板编译] --> DEPS[依赖收集]
        DEPS --> MAP[依赖映射表]
    end
    
    subgraph "数据变更"
        API_CALL[API调用] --> DS_UPDATE[数据源更新]
        DS_UPDATE --> TRIGGER[触发依赖]
    end
    
    subgraph "视图更新"
        TRIGGER --> NODE_UPDATE[节点更新]
        NODE_UPDATE --> RENDER[重新渲染]
    end
    
    MAP --> TRIGGER
```

### 6. UI 组件库

**位置：** `packages/ui/` 和 `packages/ui-vue2/`  
**职责：** 提供低代码平台的组件实现

#### 组件设计原则

- **Schema 驱动**：完全基于配置进行渲染
- **属性统一**：标准化的属性接口设计
- **样式隔离**：避免样式冲突和污染
- **事件规范**：统一的事件处理机制

#### 核心组件

| 组件 | 描述 | 特性 |
|------|------|------|
| **QPage** | 页面容器 | 根节点，管理全局样式和布局 |
| **QContainer** | 通用容器 | 支持各种布局方式，可嵌套 |
| **QText** | 文本组件 | 支持富文本和数据绑定 |
| **QButton** | 按钮组件 | 多种样式和交互状态 |
| **QImg** | 图片组件 | 懒加载和响应式适配 |
| **QVideo** | 视频组件 | 多格式支持和控制选项 |
| **QOverlay** | 遮罩层 | 模态框和弹层基础 |

### 7. Schemas（协议定义）

**位置：** `packages/schemas/`  
**职责：** 定义低代码平台的数据结构和类型协议

#### 核心数据结构

```typescript
// 根配置
interface ISchemasRoot {
  id: string;
  designWidth: number;
  children: ISchemasPage[];
  dataSources: IDataSourceSchema[];
}

// 页面配置
interface ISchemasPage {
  field: string;
  type: 'page';
  children: ISchemasNode[];
}

// 组件节点配置
interface ISchemasNode {
  field: string;
  type: string;
  componentProps: Record<string, any>;
  children?: ISchemasNode[];
  ifShow?: ICondition[];
}
```

## 🔄 数据流向和交互流程

### 完整的编辑流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Editor as 编辑器
    participant Sandbox as 沙箱
    participant Runtime as 运行时
    participant Core as 核心库
    
    User->>Editor: 拖拽组件到画布
    Editor->>Editor: 生成组件配置
    Editor->>Sandbox: 通知组件添加
    Sandbox->>Runtime: 发送配置更新
    Runtime->>Core: 创建组件实例
    Core->>Runtime: 渲染组件
    Runtime->>Sandbox: 通知渲染完成
    Sandbox->>Editor: 更新选中状态
    Editor->>User: 显示操作结果
```

### 数据绑定流程

```mermaid
sequenceDiagram
    participant Template as 模板编译
    participant DepCollector as 依赖收集器
    participant DataSource as 数据源
    participant Node as 节点
    participant View as 视图
    
    Template->>DepCollector: 发现 ${dataSource.field}
    DepCollector->>DepCollector: 记录依赖关系
    DataSource->>DataSource: 数据发生变化
    DataSource->>DepCollector: 触发变更事件
    DepCollector->>Node: 通知相关节点更新
    Node->>View: 重新渲染组件
```

### 事件处理流程

```mermaid
sequenceDiagram
    participant Component as 组件
    participant EventBus as 事件总线
    participant DataSource as 数据源
    participant API as 外部API
    
    Component->>EventBus: 触发点击事件
    EventBus->>DataSource: 调用数据源方法
    DataSource->>API: 发送网络请求
    API->>DataSource: 返回响应数据
    DataSource->>EventBus: 发出数据变更事件
    EventBus->>Component: 更新相关组件
```

## 🛠️ 技术栈和工程化

### 核心技术栈

**前端技术**
- **框架**：Vue 3.x / Vue 2.x + TypeScript
- **构建工具**：Vite + Rollup
- **状态管理**：Pinia + 自定义响应式系统
- **UI 框架**：Ant Design Vue
- **代码编辑器**：Monaco Editor
- **拖拽交互**：Moveable.js
- **样式处理**：Sass/Less

**工程化工具**
- **包管理**：pnpm (Monorepo)
- **构建优化**：Turbo
- **代码规范**：ESLint + Prettier
- **类型检查**：TypeScript
- **版本管理**：Changesets
- **提交规范**：Conventional Commits

### Monorepo 架构

```
quantum-lowcode/
├── apps/                      # 应用目录
│   ├── playground/            # 演示应用
│   └── quantum-docs/          # 文档站点
├── packages/                  # 核心包目录
│   ├── core/                  # 核心库
│   ├── editor/                # 编辑器
│   ├── sandbox/               # 沙箱画布
│   ├── data-source/           # 数据源管理
│   ├── ui/                    # Vue3 组件库
│   ├── ui-vue2/               # Vue2 组件库
│   ├── schemas/               # 协议定义
│   ├── utils/                 # 工具函数
│   └── cli/                   # 命令行工具
├── runtime/                   # 运行时目录
│   ├── vue2-active/           # Vue2 运行时
│   └── vue3-active/           # Vue3 运行时
├── pnpm-workspace.yaml        # pnpm 工作空间配置
└── turbo.json                 # Turbo 构建配置
```

## 🎯 核心优势

### 1. 完整的低代码解决方案
- **设计即开发**：所见即所得的编辑体验
- **代码生成**：自动生成高质量的组件代码
- **多端适配**：支持PC端和移动端应用
- **发布部署**：一键打包和发布功能

### 2. 高度的可扩展性
- **插件系统**：支持自定义组件和功能扩展
- **多框架支持**：Vue2/Vue3双运行时架构
- **自定义组件**：完全自定义的组件开发能力
- **主题定制**：灵活的主题和样式定制

### 3. 企业级特性
- **性能优化**：虚拟滚动、懒加载等优化策略
- **协作开发**：团队协作和版本管理支持
- **权限控制**：细粒度的权限管理系统
- **监控调试**：完善的调试和监控工具

### 4. 开发者友好
- **TypeScript**：完整的类型定义和检查
- **热更新**：开发时的快速热更新
- **调试工具**：丰富的调试和开发工具
- **文档完善**：详细的API文档和示例

## 🚀 使用场景

### 1. 营销页面搭建
- 快速搭建活动页面、宣传页面
- 支持复杂的交互和动画效果
- 数据埋点和分析集成

### 2. 管理后台开发
- 表单页面、列表页面快速生成
- 数据可视化组件集成
- 权限管理和用户系统

### 3. 移动端应用
- H5页面和小程序页面开发
- 响应式设计和移动端适配
- 原生交互和手势支持

### 4. 原型设计和演示
- 快速原型验证和演示
- 设计稿到代码的无缝转换
- 交互原型和用户体验验证

## 📈 发展规划

### 已完成功能
- ✅ 核心架构和基础功能
- ✅ 可视化编辑器界面
- ✅ 双运行时支持（Vue2/Vue3）
- ✅ 基础组件库
- ✅ 数据绑定和响应式系统
- ✅ 拖拽交互和画布功能

### 正在开发
- 🚧 样式编辑器增强
- 🚧 事件配置系统完善
- 🚧 组件树管理优化
- 🚧 历史记录和撤销重做

### 计划功能
- 📋 插件系统和自定义组件市场
- 📋 模板库和代码生成
- 📋 团队协作和版本管理
- 📋 性能监控和调试工具
- 📋 React/Angular 运行时支持
- 📋 小程序和App端适配

通过这个总览文档，您可以全面了解 Quantum 低代码平台的整体架构、核心模块、技术实现和发展方向。每个模块都有详细的专门文档进行深入介绍，建议根据需要查阅相应的专项文档。
