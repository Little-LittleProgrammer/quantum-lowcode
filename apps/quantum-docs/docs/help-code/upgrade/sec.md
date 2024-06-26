# 二次开发

正常情况下 当现有`runtime`不满足新项目或需求时, 可以二次开发 `runtime`

## runtime
> 参考 runtime/render-vue2-active

### 添加依赖
```bash
pnpm i @quantum-lowcode/core @quantum-lowcode/schemas @quantum-lowcode/sandbox 
pnpm i 自己的组件库
```

### 搭建预览项目以及 最终项目

```vue
<template>
    <div id="app">
        <page v-if="pageConfig" :config="pageConfig" :key="pageConfig.field"></page>
    </div>

</template>

<script lang="ts">
import { computed, defineComponent, inject, nextTick, ref, watch } from 'vue';

import type { Id, ISchemasRoot, ISchemasPage } from '@quantum-lowcode/schemas';
import type { LowCodeRoot } from '@quantum-lowcode/core';
import { IQuantum} from '@quantum-lowcode/sandbox';
import Page from '../src/page/index.vue';

export default defineComponent({
    components: {
        page: Page,
    },
    setup() {
        const app = inject<LowCodeRoot | undefined>('app');

        const root = ref<ISchemasRoot>();
        const curPageId = ref<Id>();
        const selectedId = ref<Id>();

        const pageConfig = computed(
            () => root.value?.children?.find((item: ISchemasPage) => item.field === curPageId.value) || root.value?.children?.[0]
        );

        return {
            pageConfig,
        };
    },
});
</script>

<style lang="scss">
</style>

```

### 与 editor通讯
因为`runtime`无法获取`editor`编写的`schema`, 所以需要通过 `editor` 注入到 `window.quantum`, 以便 与`runtime`
```ts
window.quantum?.onRuntimeReady({
    getApp() {
        return app;
    },

    updateRootConfig(config: ISchemasRoot) {
        root.value = config;
        app?.setConfig(config, curPageId.value);
    },

    updatePageField(id: Id) {
        curPageId.value = id;
        console.log(id);
        app?.setPage(id);
    },

    select(id: Id) {
        selectedId.value = id;

        if (app?.getPage(id)) {
            this.updatePageField?.(id);
        }

        const el = document.getElementById(`${id}`);
        if (el) return el;
        // 未在当前文档下找到目标元素，可能是还未渲染，等待渲染完成后再尝试获取
        return nextTick().then(() => document.getElementById(`${id}`) as HTMLElement);
    },
});
```

## 编辑器

### 添加依赖
```bash
pnpm i @quantum-lowcode/core @quantum-lowcode/schemas @quantum-lowcode/editor @quantum-lowcode/sandbox @quantum-lowcode/ui
```

### 编写编辑器

```vue
<!--  -->
<template>
    <div class="editor-container">
        <quantum-editor 
            class="editor-container-content"
            v-model:value="schemas"
            :boxRect="sandboxRect"
            :runtime-url="runtimeUrl"
        >
        </quantum-editor>
    </div>
</template>

<script lang='ts' setup>
import { computed, nextTick, reactive, ref, toRaw, watch } from 'vue'
import {QuantumEditor} from '@quantum-lowcode/editor'
import { ISchemasRoot } from '@quantum-lowcode/schemas';
defineOptions({ 
     name: 'Editor'
})

// 上面runtime步骤搭建出来的地址
const runtimeUrl = ref('/playground/index.html');

const schemas = ref<ISchemasRoot>(testSchemas);
let id = null;


const sandboxRect = ref({
    width: 375,
    height: 667,
});

</script>
<style lang='scss'>
</style>
```

```bash
# 运行
pnpm dev
```
### 