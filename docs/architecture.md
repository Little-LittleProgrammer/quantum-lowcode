# 系统架构

## 整体架构

Quantum Lowcode 采用分层架构设计，主要分为以下几个层次：

```
┌─────────────────────────────────────────────────────────────┐
│                        应用层 (Application)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Playground │  │  文档站点   │  │   自定义应用        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      编辑器层 (Editor Layer)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Editor    │  │   Sandbox   │  │   UI 组件库        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                       核心层 (Core Layer)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    Core     │  │   Schemas    │  │     Utils          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                      运行时层 (Runtime Layer)                 │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │   Vue3 Runtime      │  │   Vue2 Runtime      │          │
│  └─────────────────────┘  └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 核心模块

### 1. Core (核心库)

核心库负责低代码应用的数据模型、存储与处理，以及事件状态管理。

**主要类**：
- `LowCodeRoot` - 根节点类，管理系统生命周期
- `LowCodePage` - 页面类，管理页面节点
- `LowCodeNode` - 节点类，代表单个组件或容器

### 2. Editor (编辑器)

可视化编辑器模块，提供完整的拖拽式编辑体验。

**主要组件**：
- `Framework` - 整体布局框架
- `Workspace` - 工作区
- `Sandbox` - 画布组件
- `PropsEditor` - 属性编辑器

**服务层**：
- `EditorService` - 编辑器核心服务
- `UiService` - UI 状态管理
- `HistoryService` - 撤销/重做
- `PropsService` - 属性配置管理
- `ComponentService` - 组件列表管理
- `DataSourceService` - 数据源管理
- `ContentmenuService` - 右键菜单
- `StorageService` - 本地存储

### 3. Sandbox (沙箱)

沙箱模块负责编辑器与运行时的通信，提供隔离的编辑环境。

**核心类**：
- `BoxCore` - 沙箱核心，管理所有操作
- `BoxRender` - iframe 渲染器
- `BoxMask` - 蒙层，管理选择和高亮
- `ActionManager` - 交互管理器

### 4. Schemas (协议)

定义低代码配置的 JSON Schema 标准。

**主要类型**：
- `ISchemasNode` - 节点配置
- `ISchemasContainer` - 容器配置
- `ISchemasPage` - 页面配置
- `ISchemasRoot` - 根配置

### 5. Utils (工具库)

提供各种工具函数：

- DOM 操作
- 数据处理
- 事件系统
- HTTP 请求

### 6. Data-Source (数据源)

数据源管理模块：

- 支持 base 和 http 两种数据源类型
- 数据绑定和依赖管理
- 全局方法调用

### 7. UI (组件库)

运行时使用的 Vue 组件库：

- `QPage` - 页面容器
- `QContainer` - 容器组件
- `QComponent` - 动态组件渲染
- `QButton` - 按钮
- `QText` - 文本
- `QImg` - 图片
- `QVideo` - 视频

## 数据流向

```
用户操作 → Editor → DataSource → Core → Schema 更新
                                    ↓
                               Sandbox → Runtime → 组件渲染 → 页面展示
                                                      ↓
                                              用户交互 → 事件触发
```

## 通信机制

### 编辑器与沙箱

通过 `postMessage` 和 `window.quantum` API 进行通信。

### 沙箱与运行时

运行时通过 `window.quantum` API 与沙箱通信：

- `quantum.select()` - 选中节点
- `quantum.highlight()` - 高亮节点
- `quantum.update()` - 更新节点
- `quantum.add()` - 添加节点
- `quantum.delete()` - 删除节点

## 下一步

- 阅读 [Schema 协议](./schema.md) 了解配置格式
- 阅读 [组件模型](./component-model.md) 了解组件定义
- 阅读 [核心包文档](./packages/core.md) 深入了解核心库
