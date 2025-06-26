<template>
    <page v-if="pageConfig && pageConfig.field" :config="pageConfig" :key="`${pageConfig.field}-${updateKey}`"></page>
</template>

<script lang="ts">
import { defineComponent, inject, nextTick, ref} from 'vue';

import type { LowCodeRoot, LowCodePage } from '@quantum-lowcode/core';
import type { IQuantum } from '@quantum-lowcode/sandbox';
import {Page} from '@quantum-lowcode/ui';
import { replaceChildNode, addParamToUrl, js_utils_deep_copy } from '@quantum-lowcode/utils';
import type { ISchemasNode, ISchemasPage } from '@quantum-lowcode/schemas';

declare global {
    interface Window {
        quantum: IQuantum;
        appInstance: LowCodeRoot;
    }
}

export default defineComponent({
    components: {
        page: Page
    },
    setup() {
        const app = inject<LowCodeRoot | undefined>('app');

        // 使用 ref 来保存页面配置
        const pageConfig = ref<ISchemasPage>(app?.page?.data || {} as ISchemasPage);
        // 添加一个更新键来强制重新渲染
        const updateKey = ref(0);

        app?.on('page-change', (page: LowCodePage | string) => {
            if (typeof page === 'string') {
                throw new Error(`ID为${page}的页面不存在`);
            }
            addParamToUrl({ page: page.data.field }, window);
        });

        // 数据更新
        app?.dataSourceManager?.on('update-data', (nodes: ISchemasNode[], sourceId: string, data: any) => {
            // 创建页面配置的深拷贝
            const newPageConfig = js_utils_deep_copy(pageConfig.value);

            nodes.forEach((node) => {
                // 在拷贝的数据上进行更新
                replaceChildNode(node, [newPageConfig]);
            });

            // 重新赋值整个配置对象来触发响应式更新
            pageConfig.value = newPageConfig;
            updateKey.value++;

            console.log('最终的pageConfig', pageConfig.value);

            if (!app) return;

            nextTick(() => {
                app.emit('replaced-node', { nodes, sourceId, data });
            });
        });

        return {
            pageConfig,
            updateKey
        };
    }
});
</script>

<style lang="scss">
html,body {margin: 0; padding: 0}

// .quantum-ui-page {
//     height: 100%;
//     overflow: auto;
// }

::-webkit-scrollbar {
    width: 0 !important;
}

html,
body,
#app {
    width: 100%;
    height: 100%;
}

#app {
    position: relative;
    overflow: auto;
}
</style>
