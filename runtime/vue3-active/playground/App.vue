<template>
    <page v-if="pageConfig" :config="pageConfig" :key="pageConfig.field"></page>
</template>

<script lang="ts">
import { computed, defineComponent, inject, nextTick, reactive, ref, watch } from 'vue';

import type { LowCodeRoot } from '@quantum-lowcode/core';
import type { Id, ISchemasRoot, ISchemasPage } from '@quantum-lowcode/schemas';
import type { IQuantum, IUpdateData } from '@quantum-lowcode/sandbox';
import {Page} from '@quantum-lowcode/ui';
import { replaceChildNode } from '@quantum-lowcode/utils';

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

        const root = ref<ISchemasRoot>();
        const curPageId = ref<Id>();
        const selectedId = ref<Id>();

        const pageConfig = computed(() => {
            console.log(root.value);
            return root.value?.children?.find((item: ISchemasPage) => item.field === curPageId.value) || root.value?.children?.[0];
        });

        watch(pageConfig, async() => {
            await nextTick();
            const page = document.querySelector<HTMLElement>('.quantum-ui-page');
            page && window.quantum.onPageElUpdate(page);
        });
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

            update({config, parentId }: IUpdateData) {
                if (!root.value || !app) throw new Error('未初始化');

                replaceChildNode(reactive(config), [root.value as any], parentId);

                const nodeInstance = app.page?.getNode(config.field);
                if (nodeInstance) {
                    nodeInstance.setData(config);
                }
            }

        });

        return {
            pageConfig
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
