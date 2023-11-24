<!--  -->
<template>
    <div class="q-editor-workspace">
        <div class="workspace-header">
            <breadcrumb>
                <breadcrumb-item v-for="(item) in path" :key="item.field">
                    {{ item.field }}    
                </breadcrumb-item>
            </breadcrumb>
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
import {Breadcrumb, BreadcrumbItem} from 'ant-design-vue'
import { IServices } from '../../types';
import EditorSandbox from './sandbox.vue';
import pageBar from './page-bar.vue';
import { get_node_path } from '@qimao/quantum-utils';
defineOptions({
    name: 'QEditorWokrspace'
})

const services = inject<IServices>('services');

const page = computed(() => services?.editorService.get('page'));
const node = computed(() => services?.editorService?.get('node'));
const root = computed(() => services?.editorService?.get('root'));
const path = computed(() => get_node_path(node.value?.field || '', root.value?.children || []));


</script>
<style lang='scss' scoped>
.q-editor-workspace {
    height: 100%;
    width: 100%;
    position: relative;
    .workspace-header {
        height: 32px;
    }

    .workspace-content {
        height: calc(100% - 64px);
    }
    .workspace-footer {
        height: 32px;
        line-height: 32px;
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 2;
    }
}
</style>