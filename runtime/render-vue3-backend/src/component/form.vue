<!--  -->
<template>
    <q-antd-form @register="registerForm"></q-antd-form>
</template>

<script lang='ts' setup>
import { computed } from 'vue'
import {QAntdForm, useForm, FormSchema} from '@q-front-npm/vue3-antd-pc-ui';

import { ISchemasNode } from '@qimao/quantum-core';
defineOptions({
    name: 'EditorForm'
})
const props = defineProps<{
    config: ISchemasNode;
}>();

const schemas = computed<FormSchema[]>(() => {
    return (props.config.children as any)
})

const [registerForm] =useForm({
    ...props.config.componentProps,
    schemas,
})

</script>
<style lang='scss' scoped>
</style>