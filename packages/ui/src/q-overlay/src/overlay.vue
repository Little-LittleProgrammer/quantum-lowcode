<template>
    <runtime-container v-if="visible" class="quantum-ui-overlay" :config="{ children: config.children|| [] }">
      <slot></slot>
    </runtime-container>
</template>
<script lang="ts">
import { PropType, defineComponent, ref } from 'vue';
import Container from '../../q-container/src/container.vue';

import type { ISchemasNode} from '@quantum-lowcode/schemas';

import {useApp} from '../../hooks/use-app';

export default defineComponent({
    name: 'QOverlay',
    props: {
        config: {
            type: Object as PropType<ISchemasNode>,
            default: () => ({}),
        },

        model: {
            type: Object,
            default: () => ({}),
        },
    },
    components: {
        'runtime-container': Container
    },

    setup(props) {
        const visible = ref(false);
        const openOverlay = () => {
            visible.value = true;
            // if (app) {
            //   app.emit('overlay:open', node);
            // }
        };

        const closeOverlay = () => {
            visible.value = false;
            // if (app) {
            //   app.emit('overlay:close', node);
            // }
        };
        const {app} = useApp({
            config: props.config,
            methods: {openOverlay, closeOverlay}
        });
        
        app?.page?.on('editor:select', (info, path) => {
            if (path.find((node: ISchemasNode) => node.field === props.config.field)) {
                openOverlay();
            } else {
                closeOverlay();
            }
        }, true);

        return {
            visible,
            openOverlay,
            closeOverlay,
        };
    },
});
</script>

<style lang="scss" scoped>
.quantum-ui-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.45);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style> 
