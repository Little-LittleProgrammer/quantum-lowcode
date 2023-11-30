<template>
    <div
        v-if="display"
        :id="config.field"
        class="magic-ui-container"
        ref="refRuntimeContainer"
        :style="style"
    >
        <slot></slot>
        <runtime-component v-for="item in config.children" :key="item.field" :config="item"></runtime-component>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import type { ISchemasPage } from '@qimao/quantum-core';

import Component from '../component/index.vue';
import { js_is_function } from '@qimao/quantum-utils';
import { useApp } from '../hooks/use-app';
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
        const {app}= useApp(props);
        const ifShow = computed(() => {
            if (props.config.ifShow) {
                return props.config.ifShow
            }
            return true
        });
        const refRuntimeContainer= ref();
        const getStyle = computed(() => {
            if (js_is_function(props.config.style)) {
                props.config.style(refRuntimeContainer.value?.$el)
                return {}
            }
            return app?.transformStyle(props.config.style || {})
        })
        
        return {
            style: getStyle,
            display: ifShow,
        };
    }
});
  </script>
  