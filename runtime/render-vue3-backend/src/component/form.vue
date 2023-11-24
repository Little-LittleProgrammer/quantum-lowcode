<!--  -->
<template>
    <q-form @register="registerForm"></q-form>
</template>

<script lang='ts' setup>
import { computed } from 'vue'
import {QForm, useForm} from '@q-front-npm/vue3-antd-pc-ui';

import { ISchemasNode } from '@qimao/quantum-core';
defineOptions({
     name: 'EditorForm'
})
const props = defineProps<{
    config: ISchemasNode;
}>();

const scheams = computed(() => {
    return (props.config.componentProps as any).schemas
})

const [registerForm] =useForm({
    ...props.config.componentProps,
    scheams,
})

</script>
<style lang='scss' scoped>
</style>