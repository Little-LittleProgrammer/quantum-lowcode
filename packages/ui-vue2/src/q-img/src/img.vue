<template>
    <img :src="src" @click="handlerClick"/>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import type { ISchemasNode} from '@qimao/quantum-schemas';

import {useApp} from '../../hooks/use-app';

export default defineComponent({
    props: { // 配置要传入的props, 与formSchema.ts配置对应
        config: { // 必须拥有, 用来接收 输入的schemaDsl
            type: Object as PropType<ISchemasNode>,
            default: () => ({}), 
        },
        src: {
            type: String,
            default: ''
        }
    },
    emits: ['click'],
    setup(props, {emit}) {
        useApp(props)
        function handlerClick(e) {
            emit('click', e)
        }
        return {
            handlerClick
        }
    },
});
</script>