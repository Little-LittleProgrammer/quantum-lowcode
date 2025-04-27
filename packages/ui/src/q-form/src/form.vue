<!--  -->
<template>
    <q-antd-form @register="registerForm"></q-antd-form>
</template>

<script lang='ts' setup>
import { computed, inject } from 'vue';
import {QAntdForm, useForm, FormSchema} from '@quantum-design/vue3-antd-pc-ui';

import type { ISchemasNode } from '@quantum-lowcode/schemas';
defineOptions({
    name: 'EditorForm',
});
const props = defineProps<{
    config: ISchemasNode;
}>();

const app = inject('app');

const schemas = computed<FormSchema[]>(() => {
    return (props.config.children as any);
});

const [registerForm] = useForm({
    ...props.config.componentProps,
    schemas,
});

</script>
<style lang='scss' scoped>
</style>
