# Vue3 运行时

Vue3 运行时提供完整的 Vue 3 应用运行环境。

## 安装

```bash
pnpm add @quantum-lowcode/runtime-vue3
```

## 概述

Vue3 运行时是面向 Vue 3 项目的低代码运行时，负责渲染低代码配置的页面。

## 项目结构

```
@quantum-lowcode/runtime-vue3/
├── page/
│   ├── main.ts          # 入口文件
│   └── App.vue          # 根组件
├── types/
│   └── index.d.ts       # 类型定义
└── package.json
```

## 快速开始

### 1. 创建入口文件

```typescript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { QuantumRuntime } from '@quantum-lowcode/runtime-vue3';

const app = createApp(App);

// 初始化 Quantum 运行时
QuantumRuntime.init(app);

app.mount('#app');
```

### 2. 创建根组件

```vue
<!-- App.vue -->
<template>
  <page v-if="pageConfig" :config="pageConfig" :key="pageConfig.field" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Page } from '@quantum-lowcode/ui';

const pageConfig = ref<ISchemasPage | null>(null);

onMounted(async () => {
  // 从 URL 获取配置或加载本地配置
  const config = await fetch('/api/page-config').then(r => r.json());
  pageConfig.value = config;
});
</script>
```

### 3. 注册组件

```typescript
// components.ts
import { LowCodeRoot } from '@quantum-lowcode/core';
import { QButton, QText, QImg, QContainer } from '@quantum-lowcode/ui';

// 创建根实例
const root = new LowCodeRoot({
  config: dsl,
  designWidth: 750
});

// 注册组件
root.registerComponent('q-button', QButton);
root.registerComponent('q-text', QText);
root.registerComponent('q-img', QImg);
root.registerComponent('q-container', QContainer);
```

## 与 Core 集成

运行时通过 `@quantum-lowcode/core` 管理应用：

```typescript
import { LowCodeRoot } from '@quantum-lowcode/core';

const app = new LowCodeRoot({
  config: schema,
  designWidth: 750,
  platform: 'pc'
});

// 设置配置
app.setConfig(schema);

// 切换页面
app.setPage('page1');

// 销毁
app.destroy();
```

## 配置加载

### 从 localStorage 加载

```typescript
// utils/index.ts
export function getLocalConfig() {
  const config = localStorage.getItem('quantum_page_config');
  return config ? JSON.parse(config) : null;
}
```

### 从 URL 加载

```typescript
const pageId = new URLSearchParams(window.location.search).get('page');
```

## HTTP 请求

运行时内置 HTTP 请求拦截器：

```typescript
// utils/http.ts
import axios from 'axios';

const http = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 请求拦截
http.interceptors.request.use(config => {
  // 添加 token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截
http.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
);

export default http;
```

## 环境配置

### 开发环境

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173
  }
});
```

### 生产构建

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',
    cssCodeSplit: false
  }
});
```

## 使用示例

完整示例：

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { LowCodeRoot } from '@quantum-lowcode/core';
import { QButton, QText, QImg, QPage, QContainer, QComponent } from '@quantum-lowcode/ui';
import { getLocalConfig } from './utils';

// 加载配置
const schema = getLocalConfig() || { type: 'root', children: [] };

// 创建应用
const app = new LowCodeRoot({
  config: schema,
  designWidth: 750
});

// 注册组件
app.registerComponent('q-page', QPage);
app.registerComponent('q-container', QContainer);
app.registerComponent('q-button', QButton);
app.registerComponent('q-text', QText);
app.registerComponent('q-img', QImg);
app.registerComponent('q-component', QComponent);

// 创建 Vue 应用
const vueApp = createApp(App);

// Provide app instance
vueApp.provide('app', app);

vueApp.mount('#app');
```

## 相关文档

- [Vue2 运行时](./vue2.md)
- [系统架构](../architecture.md)
- [快速开始](../getting-started.md)
