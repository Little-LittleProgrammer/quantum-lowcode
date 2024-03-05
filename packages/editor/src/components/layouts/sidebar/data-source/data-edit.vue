<!--  -->
<template>
    <q-antd-drawer :title="drawerTitle" width="800" @register="registerDrawer" @ok="editSave" @close="editCancel">
        <q-antd-form @register="registerForm"></q-antd-form>
    </q-antd-drawer>
</template>

<script lang='ts' setup>
import { useDrawerInner, useForm } from '@q-front-npm/vue3-antd-pc-ui';
import { FormConfig, IServices } from '../../../../types';
import { inject, ref } from 'vue';
import { IDataSourceSchema } from '@qimao/quantum-schemas';
defineOptions({
    name: 'DataEdit',
});
const { dataSourceService, } = inject<IServices>('services') || {};

const values = ref<Partial<IDataSourceSchema>>({});
const dataSourceConfig = ref<FormConfig>([]);
const drawerTitle = ref('');

defineEmits(['register'])

const [registerForm, {setFieldsValue, getFieldsValue, validate, resetFields, }] = useForm({
    labelWidth: 100,
    schemas: dataSourceConfig as any,
    showActionButtonGroup: false,
    baseColProps: {
        span: 24,
    },
});

const [registerDrawer, {closeDrawer, }] = useDrawerInner(async(obj: any) => {
    if (obj.key) {
        values.value = dataSourceService?.getDataSourceById(obj.key) || {};
        dataSourceConfig.value = dataSourceService?.getFormConfig(values.value.type) as any;
        drawerTitle.value = '编辑' + values.value.title;
        await setFieldsValue(values.value);
    } else {
        drawerTitle.value = '新增';
        dataSourceConfig.value = dataSourceService?.getFormConfig(obj.type) as any;
        await setFieldsValue({type: obj.type, });
    }
});

async function editSave() {
    await validate();
    const values = getFieldsValue();
    if (values.id) {
        dataSourceService?.update(values as IDataSourceSchema);
    } else {
        dataSourceService?.add(values as IDataSourceSchema);
    }
    resetFields();
    closeDrawer();
}
function editCancel() {
    resetFields();
}

</script>
<style lang='scss' scoped>
</style>
