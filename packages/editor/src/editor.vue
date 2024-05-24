<!--  -->
<template>
    <Framework >
        <template #header>
            <slot name="header" :uiService="uiService"></slot>
        </template>
        <template #nav>
            <slot name="nav" :uiService="uiService" :editorService="editorService">
                <div class="nav-menu-container">
                    <nav-menu :btn-list="btnList">
                        <template #left>
                            <slot name="nav-left" :uiService="uiService" :editorService="editorService"></slot>
                        </template>
                        <template #center>
                            <slot name="nav-center" :uiService="uiService" :editorService="editorService"></slot>
                        </template>
                        <template #right>
                            <slot name="nav-right" :uiService="uiService" :editorService="editorService"></slot>
                        </template>
                    </nav-menu>
                </div>
            </slot>
        </template>
        <template #left>
            <slot name="left" :services="services" >
                <sidebar></sidebar>
            </slot>
        </template>
        <template #workspace>
            <slot name="workspace" :editorService="editorService">
                <workspace >
                    <template #sandbox><slot name="sandbox"></slot></template>
                    <template #workspace-header><slot name="workspace-header" :editorService="editorService"></slot></template>
                </workspace>
            </slot>
        </template>
        <template #props-editor>
            <slot name="props-editor" :editorService="editorService">
                <props-editor></props-editor>
            </slot>
        </template>
    </Framework>
</template>

<script lang='ts' setup>
import { provide, reactive } from 'vue';
import Framework from './components/layouts/framework.vue';
import Workspace from './components/layouts/workspace.vue';
import { IBoxOptions, IServices } from './types';
import { uiService } from './services/ui-service';
import { editorService } from './services/editor-service';
import { componentService } from './services/component-service';
import { IEditorProps, defaultEditorProps } from './props';
import { ISchemasRoot } from '@quantum-lowcode/schemas';
import { useServicesInit } from './hooks/use-service';
import { historyService } from './services/history-service';
import navMenu from './components/layouts/nav-menu.vue';
import PropsEditor from './components/layouts/props-editor.vue';
import { propsService } from './services/props-service';
import Sidebar from './components/layouts/sidebar/index.vue';
import { dataSourceService } from './services/datasource-service';
import { contentmenuService } from './services/contentmenu-service';
import { storageService } from './services/storage-serivce';
defineOptions({
    name: 'QEditor',
});

const props = withDefaults(defineProps<IEditorProps>(), defaultEditorProps);
const emit = defineEmits<{
    'update:value': [value: ISchemasRoot | null];
}>();

const btnList = ['delete', 'undo', 'redo', 'zoom'];

const services: IServices = {
    uiService,
    editorService,
    historyService,
    propsService,
    componentService,
    dataSourceService,
    contentmenuService,
    storageService,
};

const sandboxOptions = reactive<IBoxOptions>({
    runtimeUrl: props.runtimeUrl,
    moveableOptions: props.moveableOptions,
    canSelect: props.canSelect,
    updateDragEl: props.updateDragEl,
    isContainer: props.isContainer,
    containerHighlightClassName: props.containerHighlightClassName,
    containerHighlightDuration: props.containerHighlightDuration,
    containerHighlightType: props.containerHighlightType,
    disabledDragStart: props.disabledDragStart,
    guidesOptions: props.guidesOptions,
    autoScrollIntoView: props.autoScrollIntoView
});

const {initServiceEvents, initServiceState, } = useServicesInit(props, emit, services);
initServiceState();
initServiceEvents();

provide('services', services);

provide('codeOptions', props.codeOptions);

provide('boxOptions', sandboxOptions);

defineExpose(services);
</script>
<style lang='scss'>
.moveable-control,
.moveable-line  {
    --moveable-color: #E6A817 !important;
}
</style>
