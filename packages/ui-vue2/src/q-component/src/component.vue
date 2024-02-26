<template>
    <component
        v-if="display"
        :is="tagName"
        ref="refRuntimeComp"
        :id="config.field"
        :style="style"
        :config="config"
        v-bind="propsBind"
        v-on="propsOn"
    ></component>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, markRaw } from 'vue';

import type {Fn, ISchemasNode} from '@qimao/quantum-schemas';
import {useApp} from '../../hooks/use-app';
import {js_is_function, js_is_object} from '@qimao/quantum-utils';

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
            console.log(props.config.type)
            return app && app.resolveComponent(props.config.component || props.config.type);
        });
        const ifShow = computed(() => {
            if (props.config.ifShow) {
                if (js_is_function(props.config.ifShow)) {
                    return (props.config.ifShow as Fn)(app);
                }
                return props.config.ifShow;
            }
            return true;
        });
        const refRuntimeComp = ref();
        const getStyle = computed(() => {
            if (props.config.style && js_is_function(props.config.style)) {
                (props.config.style as any)(refRuntimeComp.value?.$el);
                return {};
            }
            return app?.transformStyle(props.config.style || {});
        });
        const propsBind = computed(() => {
            const obj: Record<string, any> = {};
            if (props.config.componentProps && js_is_object(props.config.componentProps)) {
                for (const [key, val] of Object.entries(props.config.componentProps)) {
                    if (!key.startsWith('on')) {
                        obj[key] = val;
                    }
                }
            }
            console.log('bind', obj);
            return obj;
        });
        const propsOn = computed(() => {
            const obj: Record<string, any> = {};
            if (props.config.componentProps && js_is_object(props.config.componentProps)) {
                for (const [key, val] of Object.entries(props.config.componentProps)) {
                    if (key.startsWith('on')) {
                        const _subKey = key.slice(2).toLowerCase();
                        obj[_subKey] = val;
                    }
                }
            }
            console.log('propsOn', props.config.field, obj);
            return obj;
        });
        return {
            tagName: tagName,
            style: getStyle,
            display: ifShow,
            propsBind,
            propsOn,
        };
    },
});
</script>

