<template>
    <page v-if="pageConfig" :config="pageConfig" :key="pageConfig.field"></page>
</template>

<script lang="ts">
import { computed, defineComponent, inject, nextTick, reactive, ref, watch } from 'vue';

import type { LowCodeRoot } from '@quantum-lowcode/core';
import type { Id, ISchemasRoot, ISchemasPage, ISchemasNode } from '@quantum-lowcode/schemas';
import type { IDeleteData, IQuantum, IUpdateData } from '@quantum-lowcode/sandbox';
import {Page} from '@quantum-lowcode/ui';
import { getNodePath, replaceChildNode } from '@quantum-lowcode/utils';

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

            updatePageField(field: Id) {
                curPageId.value = field;
                app?.setPage(field);
            },

            select(field: Id) {
                selectedId.value = field;

                if (app?.getPage(field)) {
                    this.updatePageField?.(field);
                }

                const el = document.getElementById(`${field}`);
                if (el) return el;
                // 未在当前文档下找到目标元素，可能是还未渲染，等待渲染完成后再尝试获取
                return nextTick().then(() => document.getElementById(`${field}`) as HTMLElement);
            },

            add({ config, parentId }: IUpdateData) {
                console.log('runtime.add', config);
                if (!root.value) throw new Error('error');
                if (!selectedId.value) throw new Error('error');
                if (!parentId) throw new Error('error');

                const parent = getNodePath(parentId, [root.value]).pop();
                if (!parent) throw new Error('未找到父节点');

                if (config.type !== 'page') {
                    const parentNode = app?.page?.getNode(parent.field);
                    parentNode && app?.page?.initNode(config, parentNode);
                }

                if (parent.field !== selectedId.value) {
                    const index = parent.children?.findIndex((child: ISchemasNode) => child.field === selectedId.value);
                    parent.children?.splice(index + 1, 0, config);
                } else {
                    // 新增节点添加到配置中
                    parent.children?.push(config);
                }
            },

            update({config, parentId }: IUpdateData) {
                if (!root.value || !app) throw new Error('未初始化');
                replaceChildNode(reactive(config), [root.value as any], parentId);

                const nodeInstance = app.page?.getNode(config.field);
                if (nodeInstance) {
                    nodeInstance.setData(config);
                }
                console.log('runtime.update', config, root.value);
            },

            delete({id, parentId }: IDeleteData) {
                console.log('runtime.delete');
                if (!root.value) throw new Error('未初始化');

                const node = getNodePath(id, [root.value]).pop();
                if (!node) throw new Error('未找到目标元素');

                const parent = getNodePath(parentId, [root.value]).pop();
                if (!parent) throw new Error('未找到父元素');

                if (node.type === 'page') {
                    app?.deletePage();
                } else {
                    app?.page?.deleteNode(node.field);
                }

                const index = parent.children?.findIndex((child: ISchemasNode) => child.field === node.field);

                parent.children?.splice(index, 1);
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
