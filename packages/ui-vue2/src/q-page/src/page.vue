<template>
    <div
        :id="config.field"
        ref="refRuntimePage"
        class="quantum-ui-page quantum-ui-container"
        :style="style"
    >
        <slot></slot>
        <runtime-component v-for="item in config.children" :key="item.field" :config="item"></runtime-component>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import type { ISchemasPage } from '@quantum-lowcode/schemas';

import Component from '../../q-component/src/component.vue';
import {useApp} from '../../hooks/use-app';
import {isFunction} from '@quantum-lowcode/utils';

export default defineComponent({
    components: {
        'runtime-component': Component,
    },
    props: {
        config: {
            type: Object as PropType<ISchemasPage>,
            default: () => ({}),
        },
    },
    setup(props) {
        const refresh = () => {
            window.location.reload();
        };
        const {app, } = useApp({
            config: props.config,
            methods: {refresh}
        });
        const refRuntimePage = ref();
        const getStyle = computed(() => {
            if (isFunction(props.config.style)) {
                (props.config.style as any)(refRuntimePage.value?.$el);
                return {};
            }
            return app?.transformStyle(props.config.style || {});
        });
        return {
            style: getStyle,
        };
    },
});
</script>