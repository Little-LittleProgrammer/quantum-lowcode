<!--  -->
<template>
    <div class="q-editor-workspace">
        <div class="workspace-header">
            <breadcrumb>
                <breadcrumb-item v-for="(item) in path" :key="item.field" @click="select(item)">
                    <a href="javascript:void(0)" >{{ item.field }}</a>
                </breadcrumb-item>
            </breadcrumb>
            <slot name="workspace-header"></slot>
        </div>
        <div class="workspace-content">
            <slot name="sandbox">
                <editor-sandbox v-if="page"></editor-sandbox>
            </slot>
        </div>
        <div class="workspace-footer">
            <page-bar></page-bar>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { inject, computed } from 'vue';
import {Breadcrumb, BreadcrumbItem} from 'ant-design-vue';
import { IServices } from '../../types';
import EditorSandbox from './sandbox.vue';
import pageBar from './page-bar.vue';
import { getNodePath } from '@qimao/quantum-utils';
import { ISchemasNode } from '@qimao/quantum-schemas';
defineOptions({
    name: 'QEditorWokrspace',
});

const services = inject<IServices>('services');

const page = computed(() => services?.editorService.get('page'));
const node = computed(() => services?.editorService?.get('node'));
const root = computed(() => services?.editorService?.get('root'));
const path = computed(() => getNodePath(node.value?.field || '', root.value?.children || []));

async function select(node: ISchemasNode) {
    await services?.editorService?.select(node);
    services?.editorService?.get('sandbox')?.select(node.field);
}

</script>
<style lang='scss' scoped>
.q-editor-workspace {
    border-right: 1px solid #e8e8e8;
    height: 100%;
    width: 100%;
    position: relative;
    .workspace-header {
        display: flex;
        justify-content: space-between;
        padding: 0 10px;
        align-items: center;
        .nav-menu-container {
            // flex: 1;
        }
    }

    .workspace-content {
        height: calc(100% - 32px);
    }
    .workspace-footer {
        height: 32px;
        line-height: 32px;
        position: fixed;
        bottom: 0;
        z-index: 2;
    }
    :deep(.ant-breadcrumb a) {
        padding: 0;
    }
}
[data-theme='dark'] {
    .q-editor-workspace  {
        border-right: 1px solid #303030;
    }
}
</style>
