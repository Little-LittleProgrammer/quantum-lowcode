<template>
    <div
        :id="config.field"
        class="quantum-ui-container"
        ref="refRuntimeContainer"
        :style="getStyle"
    >
        <slot></slot>
        <runtime-component v-for="item in config.children" :key="item.field" :config="item"></runtime-component>
    </div>
</template>

<script lang="ts" setup>
import { computed, PropType, ref } from 'vue';

import type { Fn, ISchemasPage } from '@quantum-lowcode/schemas';

import RuntimeComponent from '../../q-component/src/component.vue';
import { isFunction } from '@quantum-lowcode/utils';
import { useApp } from '../../hooks/use-app';

const props = defineProps({
    config: {
        type: Object as PropType<ISchemasPage>,
        default: () => ({})
    }
});

const {app } = useApp(props);
const refRuntimeContainer = ref();
const getStyle = computed(() => {
    if (isFunction(props.config.style)) {
        props.config.style(refRuntimeContainer.value?.$el);
        return {};
    }
    return app?.transformStyle(props.config.style || {});
});
</script>

