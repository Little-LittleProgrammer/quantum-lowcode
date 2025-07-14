<template>
    <button class="quantum-ui-button" @click="handleClick">
        <slot>
            <span>{{ text }}</span>
        </slot>
    </button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import type { ISchemasNode} from '@quantum-lowcode/schemas';
import {useApp} from '../../hooks/use-app';

export default defineComponent({
    props: { // 配置要传入的props, 与formSchema.ts配置对应
        config: { // 必须拥有, 用来接收 输入的schemaDsl
            type: Object as PropType<ISchemasNode>,
            default: () => ({})
        },
        text: {
            type: String,
            default: ''
        }
    },
    emit: ['click'],
    setup(props, {emit}) {
        useApp(props);
        function handleClick(event: MouseEvent) {
            emit('click', event);
        }
        return {
            handleClick
        };
    }
});
</script>

<style lang="scss" scoped>
.quantum-ui-button {

}
</style>
