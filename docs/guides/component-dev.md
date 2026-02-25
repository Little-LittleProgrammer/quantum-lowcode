# 组件开发指南

本文档介绍如何开发自定义组件。

## 概述

Quantum Lowcode 支持自定义组件，您可以根据业务需求开发自己的组件。

## 开发流程

1. 创建组件文件
2. 实现组件逻辑
3. 配置表单 Schema
4. 注册组件

## 创建组件

### 1. 创建组件目录

在 `packages/ui/src/` 目录下创建组件文件夹：

```
packages/ui/src/
├── q-custom/           # 自定义组件
│   ├── src/
│   │   └── custom.vue # 组件实现
│   ├── index.ts       # 入口文件
│   └── formSchema.ts  # 表单配置
```

### 2. 实现组件

```vue
<!-- packages/ui/src/q-custom/src/custom.vue -->
<template>
  <div class="q-custom" :style="customStyle">
    <h3>{{ title }}</h3>
    <p>{{ content }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { ISchemasNode } from '@quantum-lowcode/schemas';

const props = defineProps<{
  config: ISchemasNode;
}>();

// 获取应用实例
const app = inject('app') as LowCodeRoot;

// 计算属性
const title = computed(() => props.config.componentProps?.title || '');
const content = computed(() => props.config.componentProps?.content || '');

// 计算样式
const customStyle = computed(() => {
  return app?.transformStyle(props.config.style) || {};
});
</script>

<style scoped>
.q-custom {
  padding: 16px;
}
</style>
```

### 3. 创建入口文件

```typescript
// packages/ui/src/q-custom/index.ts
import Custom from './src/custom.vue';

export default Custom;
export const group = {
  label: '自定义组件',
  list: [
    {
      component: 'q-custom',
      label: '自定义组件',
      icon: ''
    }
  ]
};
```

### 4. 配置表单 Schema

```typescript
// packages/ui/src/q-custom/formSchema.ts
export const formSchema = [
  {
    field: 'title',
    label: '标题',
    component: 'Input',
    componentProps: {
      placeholder: '请输入标题'
    }
  },
  {
    field: 'content',
    label: '内容',
    component: 'Input',
    componentProps: {
      type: 'textarea',
      rows: 4
    }
  },
  {
    field: 'textAlign',
    label: '对齐方式',
    component: 'Select',
    componentProps: {
      options: [
        { label: '左对齐', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右对齐', value: 'right' }
      ]
    }
  }
];
```

### 5. 注册组件

在组件库中导出：

```typescript
// packages/ui/src/components.ts
import Custom from './q-custom';

export const components = {
  // ...其他组件
  'q-custom': Custom
};
```

## 组件生命周期

使用 `useApp` hook 接入生命周期：

```typescript
import { useApp } from '@quantum-lowcode/ui';

const { app, node } = useApp(props);

// 创建时
node?.emit('created', { field: props.config.field });

// 挂载后
onMounted(() => {
  node?.emit('mounted', { field: props.config.field });
});

// 销毁时
onUnmounted(() => {
  node?.emit('destroy', { field: props.config.field });
});
```

## 事件处理

在组件中 emit 事件：

```vue
<script setup lang="ts">
const emit = defineEmits<{
  click: [event: MouseEvent];
  change: [value: string];
}>();

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};
</script>
```

事件需要在组件中声明：

```typescript
// 组件支持的事件
export const events = [
  { label: '点击', value: 'onClick' },
  { label: '变化', value: 'onChange' }
];
```

## 数据绑定

### 获取数据源

```typescript
import { inject, computed } from 'vue';

const app = inject('app') as LowCodeRoot;

// 获取数据源
const dataSource = computed(() => {
  return app?.dataSourceManager?.get('dataSourceId')?.data;
});
```

### 使用模板变量

组件属性可以使用 `${dataSource.field}` 格式的变量：

```vue
<template>
  <div>{{ compiledText }}</div>
</template>

<script setup lang="ts">
const compiledText = computed(() => {
  const text = props.config.componentProps?.text || '';
  // 由 core 编译
  return text;
});
</script>
```

## 容器组件

如果组件需要包含子组件：

```vue
<template>
  <div class="q-custom-container" :style="style">
    <runtime-component
      v-for="item in config.children"
      :key="item.field"
      :config="item"
    />
  </div>
</template>

<script setup lang="ts">
const isContainer = computed(() => {
  return props.config.children?.length > 0;
});
</script>
```

## 条件显示

组件需要支持 `ifShow` 属性：

```typescript
import { computed } from 'vue';
import { compliedConditions } from '@quantum-lowcode/utils';

const display = computed(() => {
  const ifShow = props.config.ifShow;
  if (!ifShow) return true;

  const app = inject('app') as LowCodeRoot;
  const dataSourceManager = app?.dataSourceManager;

  return compliedConditions(ifShow, dataSourceManager?.getData());
});
```

## 测试组件

在 playground 中测试：

```bash
pnpm playground
```

## 下一步

- 阅读 [Schema 协议](../schema.md) 了解配置格式
- 阅读 [编辑器使用](./editor-usage.md) 了解编辑器操作
