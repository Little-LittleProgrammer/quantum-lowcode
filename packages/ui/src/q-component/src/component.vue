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

import type {Fn, ISchemasNode} from '@quantum-lowcode/schemas';
import {useApp} from '../../hooks/use-app';
import {isFunction} from '@quantum-lowcode/utils';

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
            if (props.config.showResult === false) return false
            if (props.config.ifShow) {
                if (isFunction(props.config.ifShow)) {
                    return (props.config.ifShow as Fn)(app);
                }
                return props.config.ifShow !== false;
            }
            return true;
        });
        const refRuntimeComp = ref();
        const getStyle = computed(() => {
            if (props.config.style && isFunction(props.config.style)) {
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

