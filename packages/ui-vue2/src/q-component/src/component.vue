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
import { computed, defineComponent, type PropType, ref, markRaw, getCurrentInstance, provide, set } from 'vue';

import type {Fn, ISchemasNode} from '@quantum-lowcode/schemas';
import {useApp} from '../../hooks/use-app';
import {isFunction, isObject} from '@quantum-lowcode/utils';

export default defineComponent({
    props: {
        config: {
            type: Object as PropType<ISchemasNode>,
            default: () => ({})
        }
    },
    setup(props) {
        const {app } = useApp(props);
        const tagName: any = computed(() => {
            return app && app.resolveComponent(props.config.component || props.config.type);
        });
        const ifShow = computed(() => {
            if (app?.platform === 'editor') return true;
            if (props.config.showResult === false) return false;
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
                (props.config.style as any)(refRuntimeComp.value?.$el);
                return {};
            }
            return app?.transformStyle(props.config.style || {});
        });
        const propsBind = computed(() => {
            const obj: Record<string, any> = {};
            if (props.config.componentProps && isObject(props.config.componentProps)) {
                for (const [key, val] of Object.entries(props.config.componentProps)) {
                    if (!key.startsWith('on')) {
                        obj[key] = val;
                    }
                }
            }
            return obj;
        });
        const propsOn = computed(() => {
            const obj: Record<string, any> = {};
            if (props.config.componentProps && isObject(props.config.componentProps)) {
                for (const [key, val] of Object.entries(props.config.componentProps)) {
                    if (key.startsWith('on')) {
                        const _subKey = key.slice(2).toLowerCase();
                        obj[_subKey] = val;
                    }
                }
            }
            return obj;
        });
        return {
            tagName: tagName,
            style: getStyle,
            display: ifShow,
            propsBind,
            propsOn
        };
    }
});
</script>

