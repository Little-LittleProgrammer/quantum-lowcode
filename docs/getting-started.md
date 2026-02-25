# 快速开始

本指南将帮助你快速上手 Quantum Lowcode 平台。

## 环境要求

- **Node.js**: >= 18.18.2
- **pnpm**: >= 9.15.7
- **Git**: >= 2.0.0

## 安装步骤

### 1. 克隆项目

```bash
git clone https://github.com/little-littleprogrammer/quantum-lowcode.git
cd quantum-lowcode
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 启动开发环境

```bash
pnpm playground
```

启动后访问 http://localhost:5173 即可看到编辑器界面。

## 项目结构

```
quantum-lowcode/
├── apps/                  # 应用程序
│   └── playground/       # 在线演示
├── packages/              # 核心包
│   ├── core/            # 核心库
│   ├── editor/          # 编辑器
│   ├── sandbox/         # 沙箱
│   ├── schemas/         # 类型定义
│   ├── utils/          # 工具函数
│   ├── data-source/    # 数据源管理
│   └── ui/             # UI 组件库
├── runtime/             # 运行时
│   ├── vue3-active/    # Vue3 运行时
│   └── vue2-active/    # Vue2 运行时
└── docs/                # 文档
```

## 基本使用流程

### 1. 拖拽组件

从左侧组件面板拖拽组件到画布区域。

### 2. 配置组件

选中组件后，在右侧属性面板中配置组件属性。

### 3. 预览效果

点击预览按钮查看最终效果。

### 4. 保存配置

点击保存按钮将配置文件导出。

## 开发命令

```bash
# 安装所有依赖
pnpm install

# 构建所有包
pnpm build

# 启动开发模式
pnpm dev

# 启动 playground 演示
pnpm playground

# 代码格式化
pnpm format

# 代码检查
pnpm lint
```

## 下一步

- 阅读 [架构文档](./architecture.md) 了解系统设计
- 阅读 [Schema 协议](./schema.md) 了解配置格式
- 阅读 [组件开发指南](./guides/component-dev.md) 学习自定义组件开发
