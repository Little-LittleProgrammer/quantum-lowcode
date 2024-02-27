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
                ></q-antd-form>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { IFormValue, IServices } from '../../types';
import { js_is_array } from '@qimao/quantum-utils';
defineOptions({
    name: 'PropsEditor',
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

const init = async() => {
    if (js_is_array(valuesFn.value)) {
        for (const item of valuesFn.value) {
            await item.reset?.();
        }
    }
    if (!node.value) {
        curFormSchemas.value = [];
        return;
    }
    const type = node.value.component || node.value.type;
    curFormSchemas.value = {
        props: services?.propsService.getConfig(type),
        style: services?.propsService.getConfig('style'),
        ifShow: services?.propsService.getConfig('ifShow'),
        lifeHooks: services?.propsService.getConfig('lifeHooks'),
    };
    nextTick(() => {
        formModel.value = node.value || {};
    });
};

services?.propsService.on('props-configs-change', init);

watch(() => node.value, (val, oldVal) => {
    if (JSON.stringify(val || {}) !== JSON.stringify(oldVal || {})) { // 防止死循环
        init();
    }
});

watch(
    () => valuesFn.value,
    (val) => {
        // 因为q-form没有change事件，所以这里监听formModel的值变化，来更新, 但会造成死循环
        services?.propsService?.setFinPropsValue(val);
    },
    { deep: true, }
);

onMounted(() => {
    formRef.value.length &&
        formRef.value.forEach((item: any) => {
            valuesFn.value.push({
                getValue: item.getFieldsValue,
                setValue: item.setFieldsValue,
                value: item.formModel,
                reset: item.resetFields,
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