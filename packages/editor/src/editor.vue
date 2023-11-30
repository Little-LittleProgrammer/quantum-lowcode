<!--  -->
<template>
    <Framework >
        <template #workspace>
            <slot name="workspace" :editorService="editorService">
                <workspace >
                    <template #sandbox><slot name="sandbox"></slot></template>
                </workspace>
            </slot>
        </template>
    </Framework>
</template>

<script lang='ts' setup>
import { provide, reactive } from 'vue';
import Framework from './components/layouts/framework.vue';
import Workspace from './components/layouts/workspace.vue';
import { IServices } from './types';
import { uiService } from './services/ui-service';
import { editorService } from './services/editor-service';
import { IEditorProps, defaultEditorProps } from './props';
import { ISchemasRoot } from '@qimao/quantum-core';
import { useServicesInit } from './hooks/use-service';
defineOptions({
    name: 'QEditor',
});

const props = withDefaults(defineProps<IEditorProps>(), defaultEditorProps);
const emit = defineEmits<{
    'update:value': [value: ISchemasRoot | null];
}>();

const services: IServices = {
    uiService,
    editorService,
};

const sandboxOptions = reactive({
    runtimeUrl: props.runtimeUrl,
});

const {initServiceEvents, initServiceState, } = useServicesInit(props, emit, services);
initServiceState();
initServiceEvents();

provide('services', services);

provide('codeOptions', props.codeOptions);

provide('sandboxOptions', sandboxOptions);

defineExpose(services);
</script>
<style lang='scss' scoped>
</style>
