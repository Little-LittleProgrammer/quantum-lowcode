<template>
    <page v-if="pageConfig" :config="pageConfig" :key="pageConfig.field"></page>
</template>

<script lang="ts">
import { computed, defineComponent, inject, nextTick, reactive, ref} from 'vue';

import type { LowCodeRoot } from '@quantum-lowcode/core';
import { IQuantum} from '@quantum-lowcode/sandbox';
import {Page} from '@quantum-lowcode/ui';
import { replaceChildNode } from '@quantum-lowcode/utils';
import { ISchemasNode } from '@quantum-lowcode/schemas';

declare global {
    interface Window {
        quantum: IQuantum;
        appInstance: LowCodeRoot;
    }
}

export default defineComponent({
    components: {
        page: Page,
    },
    setup() {
        const app = inject<LowCodeRoot | undefined>('app');

        const pageConfig = ref(app?.page?.data || {});

        // 数据更新
        app?.dataSourceManager?.on('update-data', (nodes: ISchemasNode[], sourceId: string, data: any) => {
            console.log(nodes);
            nodes.forEach((node) => {
                replaceChildNode(reactive(node) as ISchemasNode, [pageConfig.value as ISchemasNode]);
            });

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
