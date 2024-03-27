<template>
    <div id="app">
        <page v-if="pageConfig" :config="pageConfig" :key="pageConfig.field"></page>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, nextTick, reactive, ref} from 'vue';

import type { LowCodePage, LowCodeRoot } from '@qimao/quantum-core';
import { IQuantum} from '@qimao/quantum-sandbox';
import {Page} from '@qimao/quantum-ui-vue2';
import { replaceChildNode, addParamToUrl } from '@qimao/quantum-utils';
import { ISchemasNode } from '@qimao/quantum-schemas';

declare global {
    interface Window {
        quantum: IQuantum;
        appInstance: LowCodeRoot;
        quantumCompConfigs: any
    }
}

export default defineComponent({
    components: {
        page: Page,
    },
    setup() {
        const app = inject<LowCodeRoot | undefined>('app');

        const pageConfig = ref(app?.page?.data || {});

        app?.on('page-change', (page: LowCodePage | string) => {
            if (typeof page === 'string') {
                throw new Error(`ID为${page}的页面不存在`);
            }
            addParamToUrl({ page: page.data.field, }, window);
        });

        // 数据更新
        app?.dataSourceManager?.on('update-data', (nodes: ISchemasNode[], sourceId: string, data: any) => {
            console.log(nodes);
            nodes.forEach((node) => {
                replaceChildNode(reactive(node) as ISchemasNode, [pageConfig.value as ISchemasNode]);
            });

            console.log(pageConfig.value);

            if (!app) return;

            nextTick(() => {
                app.emit('replaced-node', { nodes, sourceId, data, });
            });
        });

        return {
            pageConfig,
        };
    },
});
</script>

<style lang="scss">

</style>

