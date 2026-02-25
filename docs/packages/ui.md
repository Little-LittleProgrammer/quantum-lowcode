# @quantum-lowcode/ui Vue3 组件库

UI 组件库，提供运行时使用的 Vue 3 组件。

## 安装

```bash
pnpm add @quantum-lowcode/ui
```

## 概述

组件库包含基础 UI 组件，用于渲染低代码配置的页面。

## 组件

### QPage - 页面容器

页面根容器组件。

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

### QContainer - 容器组件

用于分组子组件的容器。

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

### QComponent - 动态组件

核心渲染组件，根据配置动态渲染。

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

### QButton - 按钮组件

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

### QText - 文本组件

支持变量插值和 HTML 渲染。

```vue
<template>
  <span :class="['quantum-text', className]" :style="style">
    {{ compiledText }}
  </span>
</template>
```

### QImg - 图片组件

```vue
<template>
  <img
    :src="src"
    :alt="alt"
    :style="style"
    :loading="loading"
    @error="handleError"
  />
</template>
```

### QVideo - 视频组件

```vue
<template>
  <video
    :src="src"
    :controls="controls"
    :autoplay="autoplay"
    :loop="loop"
    :muted="muted"
    :style="style"
  />
</template>
```

### QOverlay - 遮罩层

```vue
<template>
  <div
    v-if="visible"
    class="quantum-overlay"
    :style="overlayStyle"
    @click="handleMaskClick"
  >
    <slot></slot>
  </div>
</template>
```

## Hooks

### useApp

获取应用实例和节点生命周期。

```typescript
import { useApp } from '@quantum-lowcode/ui';

const { app, node } = useApp(props);
```

#### 使用示例

```vue
<script setup lang="ts">
import { useApp } from '@quantum-lowcode/ui';

const props = defineProps<{
  config: ISchemasNode;
}>();

const { app, node } = useApp(props);

// 触发创建事件
node?.emit('created', { field: props.config.field });

// 在组件挂载后
onMounted(() => {
  node?.emit('mounted', { field: props.config.field });
});
</script>
```

## 使用示例

```typescript
import {
  QPage,
  QContainer,
  QComponent,
  QButton,
  QText,
  QImg
} from '@quantum-lowcode/ui';

// 注册组件
const components = {
  'q-page': QPage,
  'q-container': QContainer,
  'q-component': QComponent,
  'q-button': QButton,
  'q-text': QText,
  'q-img': QImg
};

// 创建应用
const app = new LowCodeRoot({ config });

// 注册
Object.entries(components).forEach(([type, comp]) => {
  app.registerComponent(type, comp);
});
```

## 组件注册

在 Vue 应用中全局注册：

```typescript
import { QPage, QContainer, QButton, QText, QImg, QComponent } from '@quantum-lowcode/ui';

const app = createApp(App);

app.component('q-page', QPage);
app.component('q-container', QContainer);
app.component('q-button', QButton);
app.component('q-text', QText);
app.component('q-img', QImg);
app.component('runtime-component', QComponent);
```

## 样式

组件库使用 Scoped CSS，可以自定义样式变量：

```css
:root {
  --quantum-primary-color: #1890ff;
  --quantum-border-radius: 4px;
}
```

## 相关文档

- [组件模型](../component-model.md)
- [组件开发指南](../guides/component-dev.md)
- [Vue3 运行时](../runtime/vue3.md)
