<!--  -->
<template>
    <div class="q-editor-props-editor" v-show="nodes.length === 1">
        <slot name="props-editor-header"></slot>
        <a-tabs v-model:activeKey="activeKey" size="small">
            <a-tab-pane
                :forceRender= "true"
                v-for="item in getTabList"
                :key="item.value"
                :tab="item.label"
            >
                <q-antd-form
                    ref="formRef"
                    :model="formModel"
                    :baseColProps="{ span: 22 }"
                    :labelWidth="100"
                    :showActionButtonGroup="false"
                    :schemas="curFormSchemas[item.value]"
                    @blur="changeValue"
                ></q-antd-form>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { IFormValue, IServices } from '../../types';
import { isArray, isNumber } from '@quantum-lowcode/utils';
defineOptions({
    name: 'PropsEditor'
});

const services = inject<IServices>('services');

const node = computed(() => services?.editorService.get('node'));
const nodes = computed(() => services?.editorService.get('nodes') || []);
const activeKey = ref('props');

const valuesFn = ref<IFormValue[]>([]);

const formRef = ref([]);
const formModel = ref({});

const getTabList = computed(() => {
    return services?.propsService?.getPropsTabsList();
});

const curFormSchemas = ref<any>({});

const curStyleSwitch = ref(1);

const init = async(changeNode = false) => {
    curStyleSwitch.value = 1;
    if (isArray(valuesFn.value)) {
        for (const item of valuesFn.value) {
            await item.reset?.();
        }
    }
    if (!node.value) {
        curFormSchemas.value = [];
        return;
    }

    const type = node.value.component || node.value.type;
    if (!curFormSchemas.value.props) {
        curFormSchemas.value = {
            props: services?.propsService.getConfig(type),
            style: services?.propsService.getConfig('style'),
            ifShow: services?.propsService.getConfig('ifShow'),
            lifeHooks: services?.propsService.getConfig('lifeHooks')
        };
    }
    nextTick(async() => {
        formModel.value = {
            ...node.value,
            customStyleSwitch: curStyleSwitch.value,
            customStyle: node.value?.style
        };
        console.log('formModel', formModel.value);
    });
};

services?.propsService.on('props-configs-change', init);

watch(() => node.value, (val, oldVal) => {
    if (val?.field !== oldVal?.field) {
        curFormSchemas.value = {};
    }
    init(val?.field !== oldVal?.field);
});

function changeValue(value) {
    if (isNumber(value.customStyleSwitch)) {
        if (value.customStyleSwitch !== curStyleSwitch.value) {
            curStyleSwitch.value = value.customStyleSwitch;
            return;
        }
        Reflect.deleteProperty(value, 'customStyleSwitch');
    }
    value.style = {
        ...value.customStyle,
        ...value.style
    };
    if (value.customStyle) {
        Reflect.deleteProperty(value, 'customStyle');
    }
    const finValue = {
        ...node.value,
        ...value
    };
    if (finValue.componentProps?.events) {
        finValue.componentProps = {
            ...finValue.componentProps,
            ...finValue.componentProps.events
        };
    }
    console.log('finValue', finValue, value);

    services?.editorService.update(finValue);
}

onMounted(() => {
    formRef.value.length &&
        formRef.value.forEach((item: any) => {
            valuesFn.value.push({
                setValue: item.setFieldsValue,
                reset: item.resetFields,
                getValue: item.getFieldsValue
            });
        });
});

onBeforeUnmount(() => {
    services?.propsService.remove('props-configs-change');
});
</script>
<style lang="scss" scoped>
	.q-editor-props-editor {
		padding: 0px 20px;
		height: 100%;
		overflow-y: auto;
		:deep(.ant-tabs-top > .ant-tabs-nav) {
			margin: 0px !important;
		}
		:deep(.ant-tabs-content) {
			overflow: auto;
		}
	}
</style>
