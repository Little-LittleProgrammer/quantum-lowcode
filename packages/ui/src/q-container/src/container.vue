<template>
    <div
        v-if="display"
        :id="config.field"
        class="quantum-ui-container"
        ref="refRuntimeContainer"
        :style="style"
    >
        <slot></slot>
        <runtime-component v-for="item in config.children" :key="item.field" :config="item"></runtime-component>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import type { Fn, ISchemasPage } from '@quantum-lowcode/schemas';

import Component from '../../q-component/src/component.vue';
import { isFunction } from '@quantum-lowcode/utils';
import { useApp } from '../../hooks/use-app';
//   import {useApp} from '../hooks/use-app';

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
        const {app, } = useApp(props);
        const ifShow = computed(() => {
            if (props.config.ifShow) {
                if (isFunction(props.config.ifShow)) {
                    return (props.config.ifShow as Fn)(app);
                }
                return props.config.ifShow !== false;
            }
            return true;
        });
        const refRuntimeContainer = ref();
        const getStyle = computed(() => {
            if (isFunction(props.config.style)) {
                props.config.style(refRuntimeContainer.value?.$el);
                return {};
            }
            return app?.transformStyle(props.config.style || {});
        });

        return {
            style: getStyle,
            display: ifShow,
        };
    },
});
</script>

