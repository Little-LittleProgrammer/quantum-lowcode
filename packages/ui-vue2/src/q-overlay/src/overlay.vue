<template>
    <runtime-container v-if="visible" class="quantum-ui-overlay" :config="{ children: config.children|| [] }">
      <slot></slot>
    </runtime-container>
  </template>
  <script lang="ts">
  import { PropType, defineComponent, ref } from 'vue';
  import Container from '../../q-container/src/container.vue';
  
  import type { ISchemasNode} from '@qimao/quantum-schemas';
  
  import {useApp} from '../../hooks/use-app';
  
  export default defineComponent({
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
      const node = app?.page?.getNode(props.config.field);
  
      console.log('props.config',props.config, app?.page)
      app?.page?.on('editor:select', (info, path) => {
        if (path.find((node: ISchemasNode) => node.field === props.config.field)) {
          openOverlay();
        } else {
          closeOverlay();
        }
      });
  
      return {
        visible,
        openOverlay,
        closeOverlay,
      };
    },
  });
  </script>
  