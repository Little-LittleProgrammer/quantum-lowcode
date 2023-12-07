<template>
    <component
        v-if="display"
        :is="tagName"
        ref="refRuntimeComp"
        :id="config.field"
        :style="style"
        :config="config"
        v-bind="config.componentProps"
    ></component>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, markRaw } from 'vue';

import type {ISchemasNode} from '@qimao/quantum-schemas';
import {useApp} from '../hooks/use-app';
import {js_is_function} from '@qimao/quantum-utils';

export default defineComponent({
    props: {
        config: {
            type: Object as PropType<ISchemasNode>,
            default: () => ({}),
        },
    },
    setup(props) {
        const {app, } = useApp(props);
        const tagName: any = computed(() => {
            return app && app.resolveComponent(props.config.component || props.config.type);
        });
        const ifShow = computed(() => {
            if (props.config.ifShow) {
                if (js_is_function(props.config.ifShow)) {
                    return props.config.ifShow(app);
                }
                return props.config.ifShow;
            }
            return true;
        });
        const refRuntimeComp = ref();
        const getStyle = computed(() => {
            if (props.config.style && js_is_function(props.config.style)) {
                return (props.config.style as any)(refRuntimeComp.value?.$el);
            }
            return props.config.style;
        });
        return {
            tagName: tagName,
            style: getStyle,
            display: ifShow,
        };
    },
});
</script>

