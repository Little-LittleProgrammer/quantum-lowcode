# Vue2 运行时

Vue2 运行时提供面向 Vue 2 项目的低代码运行时。

## 安装

```bash
pnpm add @quantum-lowcode/runtime-vue2-active
```

## 概述

Vue2 运行时与 Vue3 运行时类似，但面向 Vue 2 项目，使用 `@quantum-lowcode/ui-vue2` 组件库。

## 项目结构

```
@quantum-lowcode/runtime-vue2-active/
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
import Vue from 'vue';
import App from './App.vue';
import { QuantumRuntime } from '@quantum-lowcode/runtime-vue2-active';

// 初始化 Quantum 运行时
QuantumRuntime.init();

new Vue({
  render: h => h(App)
}).$mount('#app');
```

### 2. 创建根组件

```vue
<!-- App.vue -->
<template>
  <page v-if="pageConfig" :config="pageConfig" :key="pageConfig.field" />
</template>

<script lang="ts">
import { Page } from '@quantum-lowcode/ui-vue2';
import { getLocalConfig } from './utils';

export default {
  name: 'App',
  components: { Page },
  data() {
    return {
      pageConfig: null
    };
  },
  mounted() {
    const config = getLocalConfig() || { type: 'root', children: [] };
    this.pageConfig = config;
  }
};
</script>
```

### 3. 注册组件

```typescript
import { LowCodeRoot } from '@quantum-lowcode/core';
import { QButton, QText, QImg, QContainer } from '@quantum-lowcode/ui-vue2';

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

## Vue2 组件库

Vue2 使用 `@quantum-lowcode/ui-vue2` 组件库：

```bash
pnpm add @quantum-lowcode/ui-vue2
```

```typescript
import {
  QPage,
  QContainer,
  QComponent,
  QButton,
  QText,
  QImg
} from '@quantum-lowcode/ui-vue2';
```

## 与 Vue3 运行时对比

| 特性 | Vue3 运行时 | Vue2 运行时 |
|------|-------------|-------------|
| Vue 版本 | Vue 3.x | Vue 2.7.x |
| 组件库 | @quantum-lowcode/ui | @quantum-lowcode/ui-vue2 |
| 应用创建 | createApp() | new Vue() |
| 响应式 | Composition API | Options API |

## 使用示例

```typescript
import Vue from 'vue';
import App from './App.vue';
import { LowCodeRoot } from '@quantum-lowcode/core';
import { QPage, QContainer, QButton, QText, QImg, QComponent } from '@quantum-lowcode/ui-vue2';
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

// Provide app instance
Vue.prototype.$app = app;

new Vue({
  render: h => h(App)
}).$mount('#app');
```

## 注意事项

1. Vue2 运行时使用 `Vue.prototype` 提供全局实例
2. 需要使用 `render` 函数而不是模板
3. 组件需要使用 Options API 定义

## 相关文档

- [Vue3 运行时](./vue3.md)
- [系统架构](../architecture.md)
- [快速开始](../getting-started.md)
