# 组件模型

本文档详细介绍 Quantum Lowcode 的组件模型设计。

## 概述

Quantum Lowcode 的组件模型基于 Vue 组件实现，通过 Schema 配置驱动组件渲染。

## 组件结构

每个组件都需要实现以下接口：

```typescript
interface QuantumComponent {
  /** 组件名称 */
  name: string;
  /** 组件属性 */
  props: {
    /** 节点配置 */
    config: ISchemasNode;
    /** 样式 */
    style?: Record<string, any>;
    /** 组件属性 */
    componentProps?: Record<string, any>;
  };
  /** 事件 */
  emits: string[];
}
```

## 基础组件

Quantum Lowcode 提供以下基础组件：

### 1. QPage - 页面容器

页面容器是应用的根组件，用于渲染页面结构。

```vue
<template>
  <div class="quantum-ui-page" :style="pageStyle">
    <slot></slot>
    <runtime-component
      v-for="item in config.children"
      :key="item.field"
      :config="item"
    />
  </div>
</template>
```

### 2. QContainer - 容器组件

容器组件用于分组和管理子组件。

```vue
<template>
  <div
    v-if="display"
    class="quantum-ui-container"
    :style="containerStyle"
  >
    <runtime-component
      v-for="item in config.children"
      :key="item.field"
      :config="item"
    />
  </div>
</template>
```

### 3. QComponent - 动态组件

动态组件是核心渲染组件，根据配置动态渲染对应组件。

```vue
<template>
  <component
    v-if="display"
    :is="tagName"
    :style="style"
    v-bind="config.componentProps"
  >
    <template v-if="isContainer">
      <runtime-component
        v-for="item in config.children"
        :key="item.field"
        :config="item"
      />
    </template>
  </component>
</template>
```

### 4. QButton - 按钮组件

```vue
<template>
  <button
    :class="['quantum-btn', `quantum-btn-${type}`]"
    :style="style"
    @click="handleClick"
  >
    {{ text }}
  </button>
</template>
```

### 5. QText - 文本组件

支持变量插值：

```vue
<template>
  <span :style="style">{{ compiledText }}</span>
</template>

<script>
const text = computed(() => {
  // 替换 ${dataSource.field} 格式的变量
  return props.config.componentProps?.text;
});
</script>
```

### 6. QImg - 图片组件

```vue
<template>
  <img
    :src="src"
    :alt="alt"
    :style="style"
    :loading="loading"
  />
</template>
```

### 7. QVideo - 视频组件

```vue
<template>
  <video
    :src="src"
    :controls="controls"
    :autoplay="autoplay"
    :loop="loop"
    :style="style"
  />
</template>
```

## 组件注册

组件需要注册到 LowCodeRoot 才能使用：

```typescript
import { LowCodeRoot } from '@quantum-lowcode/core';
import { QButton, QText, QImg } from '@quantum-lowcode/ui';

const app = new LowCodeRoot({
  config: schema
});

// 注册组件
app.registerComponent('q-button', QButton);
app.registerComponent('q-text', QText);
app.registerComponent('q-img', QImg);
```

## 组件开发

### 创建自定义组件

1. 创建组件文件：

```vue
<!-- packages/ui/src/q-custom/src/custom.vue -->
<template>
  <div class="q-custom" :style="style">
    <h3>{{ title }}</h3>
    <p>{{ content }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useApp } from '@quantum-lowcode/ui';

const props = defineProps<{
  config: ISchemasNode;
}>();

const { app } = useApp(props);

const title = computed(() => props.config.componentProps?.title || '');
const content = computed(() => props.config.componentProps?.content || '');

const style = computed(() => {
  return app?.transformStyle(props.config.style) || {};
});
</script>
```

2. 创建入口文件：

```typescript
// packages/ui/src/q-custom/index.ts
import Custom from './src/custom.vue';
import { group as formGroup } from '../../config';

export default Custom;

export const group = formGroup;
```

3. 在组件库中注册：

```typescript
// packages/ui/src/components.ts
import Custom from './q-custom';

export const components = {
  // ...其他组件
  'q-custom': Custom
};
```

### 配置表单 Schema

组件需要配置表单 Schema 才能在编辑器中编辑属性：

```typescript
// packages/ui/src/q-custom/formSchema.ts
export const formSchema = [
  {
    field: 'title',
    label: '标题',
    component: 'Input'
  },
  {
    field: 'content',
    label: '内容',
    component: 'Input'
  }
];
```

## 组件生命周期

组件通过 `useApp` hook 接入生命周期：

```typescript
import { inject, onMounted, onUnmounted } from 'vue';
import { useApp } from '@quantum-lowcode/ui';

export function useApp(props) {
  const app = inject('app') as LowCodeRoot;
  const node = app?.page?.getNode(props.config.field);

  // 创建
  node?.emit('created', { field: props.config.field });

  // 挂载
  onMounted(() => {
    node?.emit('mounted', { field: props.config.field });
  });

  // 销毁
  onUnmounted(() => {
    node?.emit('destroy', { field: props.config.field });
  });

  return { app, node };
}
```

## 下一步

- 阅读 [组件开发指南](./guides/component-dev.md) 深入学习组件开发
- 阅读 [编辑器使用](./guides/editor-usage.md) 了解编辑器操作
- 阅读 [UI 组件库文档](./packages/ui.md) 了解组件库详情
