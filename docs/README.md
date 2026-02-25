# Quantum Lowcode 文档

欢迎使用 Quantum Lowcode 文档！

## 项目介绍

Quantum Lowcode 是一个现代化、可扩展的跨框架低代码可视化搭建平台，采用 Monorepo 结构，使用 pnpm workspace 管理多个包。

## 核心特性

- **可视化编辑器**：所见即所得的拖拽式编辑体验
- **跨平台支持**：同时支持 PC 端和移动端 H5 应用开发
- **跨框架兼容**：支持 Vue2、Vue3 等多种前端框架
- **实时预览**：编辑过程中实时查看效果，无需等待编译
- **组件化架构**：完全组件化的设计，易于扩展和维护
- **沙箱隔离**：基于 iframe 的沙箱环境，确保编辑器稳定性
- **数据驱动**：完整的数据源管理和双向绑定机制

## 文档目录

### 入门指南

- [快速开始](./getting-started.md) - 快速上手 Quantum Lowcode
- [安装配置](./installation.md) - 环境配置和安装步骤

### 核心概念

- [系统架构](./architecture.md) - 整体架构设计
- [Schema 协议](./schema.md) - JSON Schema 协议详解
- [组件模型](./component-model.md) - 组件模型定义

### 核心包文档

- [@quantum-lowcode/core](./packages/core.md) - 核心库
- [@quantum-lowcode/editor](./packages/editor.md) - 编辑器
- [@quantum-lowcode/sandbox](./packages/sandbox.md) - 沙箱
- [@quantum-lowcode/schemas](./packages/schemas.md) - 类型定义
- [@quantum-lowcode/utils](./packages/utils.md) - 工具函数
- [@quantum-lowcode/data-source](./packages/data-source.md) - 数据源管理
- [@quantum-lowcode/ui](./packages/ui.md) - Vue3 组件库

### 运行时文档

- [Vue3 运行时](./runtime/vue3.md) - Vue3 运行时配置
- [Vue2 运行时](./runtime/vue2.md) - Vue2 运行时配置

### 使用指南

- [编辑器使用](./guides/editor-usage.md) - 编辑器操作指南
- [组件开发](./guides/component-dev.md) - 自定义组件开发
- [数据源配置](./guides/datasource.md) - 数据源配置说明
- [条件显示](./guides/conditions.md) - 条件显示配置

### API 参考

- [核心库 API](./api/core-api.md) - Core 包 API 文档
- [编辑器服务 API](./api/editor-services.md) - Editor 服务 API

## 在线演示

- [演示项目](https://little-littleprogrammer.github.io/quantum-lowcode/playground/) - 在线体验编辑器功能

## 技术栈

- **框架**：Vue 3.x + TypeScript
- **构建工具**：Vite + Rollup
- **包管理**：pnpm (Monorepo)
- **拖拽库**：Moveable

## 相关链接

- [GitHub 仓库](https://github.com/little-littleprogrammer/quantum-lowcode)
- [问题反馈](https://github.com/little-littleprogrammer/quantum-lowcode/issues)
