<template>
    <video :src="src" :controls="controls" @click="handlerClick" class="quantum-ui-video"/>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType, ref } from 'vue';

import type { ISchemasNode} from '@quantum-lowcode/schemas';

import {useApp} from '../../hooks/use-app';

export default defineComponent({
    name: 'QVideo',
    props: { // 配置要传入的props, 与formSchema.ts配置对应
        config: { // 必须拥有, 用来接收 输入的schemaDsl
            type: Object as PropType<ISchemasNode>,
            default: () => ({}), 
        },
        src: {
            type: String,
            default: ''
        },
        controls: {
            type: Boolean,
            default: true
        }
    },
    emits: ['click'],
    setup(props, {emit}) {
        useApp(props)
        function handlerClick(e: MouseEvent) {
            emit('click', e)
        }
        return {
            handlerClick
        }
    },
});
</script>

<style lang="scss" scoped>
.quantum-ui-video {
    max-width: 100%;
    height: auto;
}
</style> 
