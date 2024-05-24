<!--  -->
<template>
    <a-modal title="新增" :open="props.visible" @ok="commitOk" @cancel="commitCancel">
        <q-antd-form @register="registerForm"></q-antd-form>
    </a-modal>
</template>

<script lang='ts' setup>
import { apiSaveH5ManageProject } from '@/http/api/manage/h5-manage';
import { IGlobalSelect, IH5ManageList } from '@/http/api/manage/h5-manage/interface';
import { defaultSchemas } from '@/views/editor/init-schemas';
import { useMessage } from '@quantum-design/hooks/vue/use-message';
import { FormSchema, useForm } from '@quantum-design/vue3-antd-pc-ui';
import { computed, reactive } from 'vue'
import {serializeToString} from '@quantum-lowcode/utils'
defineOptions({
    name: 'Add'
})

const props = withDefaults(defineProps<{
    visible: boolean;
    selectObj: IGlobalSelect
}>(), {
    visible: false
})

const emit = defineEmits(['ok', 'cancel'])

const {createMessage} = useMessage()

const schemas = computed<FormSchema<IH5ManageList>[]>(() => [{
    label: '项目名称',
    field: 'title',
    component: 'Input',
    required: true
}, {
    label: '标识',
    field: 'activity',
    component: 'Input',
    required: true
}, {
    label: '所属项目',
    field: 'projectNameEn',
    component: 'Select',
    componentProps: {
        options: props.selectObj.projectOptions
    },
    required: true
}, {
    label: '设计图大小',
    field: 'designWidth',
    component: 'Input',
    defaultValue: 720
}, {
    label: '活动关键词',
    field: 'description.keywords',
    component: 'InputTextArea',
    helpMessage: '用于seo, 多个关键词请用英文分号(;)进行分割',
}, {
    label: '活动描述',
    field: 'description.description',
    component: 'InputTextArea',
    helpMessage: '用于seo, 多个描述请用英文分号(;)进行分割',
}])

const [registerForm, {getFieldsValue, resetFields, validate}] = useForm({
    schemas,
    showActionButtonGroup: false,
    labelWidth:130,
    baseColProps: {
        span: 20
    }
})

async function commitOk() {
    await validate()
    const values = getFieldsValue();
    const finDsl = defaultSchemas;
    finDsl.name = values.title;
    finDsl.children[0].style!.width = values.designWidth
    if (values.designWidth) {
        finDsl.designWidth = values.designWidth;
    }
    finDsl.description = {keywords: [], description: []}
    if (values.description.keywords) {
        finDsl.description.keywords = values.description.keywords.split(';');
    }
    if (values.description.description) {
        finDsl.description.description = values.description.description.split(';');
    }
    if (values.description) {
        Reflect.deleteProperty(values, 'description');
    }
    const res = await apiSaveH5ManageProject({
        ...values,
        pageJson: serializeToString(finDsl)
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