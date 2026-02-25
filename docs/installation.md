# 安装配置

本文档详细介绍 Quantum Lowcode 的环境配置和安装步骤。

## 环境准备

### Node.js 安装

Quantum Lowcode 需要 Node.js 18.18.2 或更高版本。

推荐使用 nvm 管理 Node.js 版本：

```bash
# 安装 nvm (Linux/Mac)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装 Node.js LTS 版本
nvm install 18
nvm use 18
```

### pnpm 安装

Quantum Lowcode 使用 pnpm 作为包管理器：

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

## 项目安装

### 克隆项目

```bash
git clone https://github.com/little-littleprogrammer/quantum-lowcode.git
cd quantum-lowcode
```

### 安装依赖

```bash
pnpm install
```

这将安装所有工作区包的依赖。

### 构建包

```bash
pnpm build
```

## 开发环境配置

### 环境变量

在项目根目录创建 `.env.local` 文件：

```env
# 开发服务器端口
VITE_PORT=5173

# API 基础地址
VITE_API_BASE_URL=http://localhost:3000
```

### IDE 配置

项目包含 VS Code 配置，建议安装以下扩展：

- ESLint
- Prettier
- Vetur (Vue2 项目)
- Volar (Vue3 项目)

## 常见问题

### pnpm install 失败

如果遇到 pnpm 安装失败，尝试清理缓存：

```bash
pnpm store prune
rm -rf node_modules
pnpm install
```

### 构建失败

确保 Node.js 版本符合要求：

```bash
node --version  # 应为 18.18.2 或更高
```

### 端口占用

如果 5173 端口被占用，可以修改 `.env.local` 中的端口配置。

## 下一步

完成安装后，可以：

1. 运行 `pnpm playground` 启动演示项目
2. 阅读 [快速开始](./getting-started.md) 了解基本使用
3. 阅读 [架构文档](./architecture.md) 深入了解系统设计
