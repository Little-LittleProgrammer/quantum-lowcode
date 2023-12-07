<!--  -->
<template>
    <q-antd-form @register="registerForm"></q-antd-form>
</template>

<script lang='ts' setup>
import { computed, inject } from 'vue';
import {QAntdForm, useForm, FormSchema} from '@q-front-npm/vue3-antd-pc-ui';

import { ISchemasNode } from '@qimao/quantum-schemas';
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
