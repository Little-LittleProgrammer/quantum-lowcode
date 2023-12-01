<!--  -->
<template>
    <a-modal title="新增" :open="props.visible" @ok="commitOk" @cancel="commitCancel">
        <q-antd-form @register="registerForm"></q-antd-form>
    </a-modal>
</template>

<script lang='ts' setup>
import { apiSaveH5ManageProject } from '@/http/api/manage/h5-manage';
import { IH5ManageList } from '@/http/api/manage/h5-manage/interface';
import { defaultSchemas } from '@/views/editor/init-schemas';
import { useMessage } from '@q-front-npm/hooks/vue/use-message';
import { FormSchema, useForm } from '@q-front-npm/vue3-antd-pc-ui';
import { computed, reactive } from 'vue'
import {serializeToString} from '@qimao/quantum-utils'
defineOptions({
    name: 'Add'
})

const props = withDefaults(defineProps<{
    visible: boolean;
}>(), {
    visible: false,
})

const emit = defineEmits(['ok', 'cancel'])

const {createMessage} = useMessage()

const schemas = computed<FormSchema<IH5ManageList>[]>(() => [{
    label: '项目名称',
    field: 'title',
    component: 'Input'
}, {
    label: '标识',
    field: 'activity',
    component: 'Input'
}, {
    label: '所属项目',
    field: 'projectNameEn',
    component: 'Input'
}])

const [registerForm, {getFieldsValue, resetFields}] = useForm({
    schemas,
    showActionButtonGroup: false,
    baseColProps: {
        span: 20
    }
})

async function commitOk() {
    const values = getFieldsValue();
    const res = await apiSaveH5ManageProject({
        ...values,
        pageJson: serializeToString(defaultSchemas)
    });
    if (res.code === 200) {
        createMessage.success('创建成功');
        emit('ok');
        resetFields()
    }
}
function commitCancel() {
    resetFields();
    emit('cancel')
}

</script>
<style lang='scss' scoped>
</style>