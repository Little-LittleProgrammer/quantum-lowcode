<!-- 事件选择
    return: {
        onClick: [
            {
                field: "base1:test2",
                params: {
                    a1: "test button1"
                }
            }
        ],
        onChange: []
    }
-->
<template>
    <div class="q-editor-event-select">
        <a-select class="select-input" v-model:value="eventKey" :options="props.options" mode="multiple" @blur="addEvent"></a-select>
        <div v-for="key in eventKey" :key="key">
            <div class="q-editor-event-select-content">
                <div class="q-editor-event-select-content-title">
                    <span >{{ props.options.find((item: any) => item.value === key)?.label }}</span>
                    <a-button type="link" size="small" @click="addEventUni(key)">
                        <template #icon>
                            <q-antd-icon type="PlusOutlined"></q-antd-icon>
                        </template>
                    </a-button>
                </div>
                <div class="q-editor-event-select-content-uni" v-for="(item, index) in props.value[key]" :key="index">
                    <div class="q-editor-event-select-content-uni-title">
                        <p class="">事件{{ index + 1 }}</p>
                        <a-button type="link" size="small" v-show="index" @click="removeEventUni(props.value[key], index)">
                            <template #icon>
                                <q-antd-icon type="DeleteOutlined"></q-antd-icon>
                            </template>
                        </a-button>
                    </div>
                    <a-form>
                        <a-form-item label="事件类型">
                            <a-select v-model:value="item.type" size="small" :options="uniOptions" @click="resetEventUni"></a-select>
                        </a-form-item>
                        <template v-if="item.type==='component'">
                            <a-form-item label="联动组件">
                                <a-select v-model:value="item.comp" :options="getCompSelect" @change="selectComp(item)"></a-select>
                            </a-form-item>
                            <a-form-item label="联动事件">
                                <a-select v-model:value="item.event" :options="getCompEventSelect(item.comp)" @change="selectCompEvent(item)"></a-select>
                            </a-form-item>
                        </template>
                        <template v-else-if="item.type==='dataSource'">
                            <a-form-item label="方法">
                                <a-tree-select v-model:value="item.field" :treeData="getDsEventSelect"  @change="selectDsEvent(item)"></a-tree-select>
                            </a-form-item>
                            <a-form-item v-if="item.field && paramsData.length" label="参数">
                                <div class="q-editor-event-select-content-uni-params" v-for="c in paramsData" :key="c.value">
                                    <a-form-item-rest>
                                        {{ c.value }}:
                                        <a-input class="input" v-model:value="item.params[c.value]"></a-input>
                                        <a-tooltip :title="c.description">
                                            <q-antd-icon type="QuestionCircleOutlined"></q-antd-icon>
                                        </a-tooltip>
                                    </a-form-item-rest>
                                </div>
                            </a-form-item>
                        </template>
                    </a-form>
                </div>
                <div v-if="showFooter" class="q-editor-event-select-content-footer">
                    <a-button size="small" type="primary" @click="confirmEvent">确认</a-button>
                </div>
            </div>

        </div>
    </div>
</template>

<script lang='ts' setup>
import { isArray } from '@quantum-lowcode/utils';
import { IServices } from '../../types';
import { computed, inject, reactive, ref, watch } from 'vue';
import { useDsList } from '../../hooks/use-ds-list';
defineOptions({
    name: 'EventSelect'
});
const props = defineProps({
    value: {
        type: Object,
        default: () => ({})
    },
    options: {
        type: Array,
        default: () => []
    }
});
const showFooter = ref(false);
const emits = defineEmits(['change', 'update:value', 'blur']);

const eventKey = ref<string[]>([]);
const uniOptions = [{label: '组件', value: 'component' }, {label: '数据源', value: 'dataSource' }];
const service = inject<IServices>('services');
const page = computed(() => service?.editorService.get('page'));
const {getDsEventSelect} = useDsList(service);

watch(() => props.value, () => {
    eventKey.value = Object.keys(props.value || []);
}, {immediate: true });

const getCompSelect = computed(() => {
    return service?.propsService.getMethods(page.value);
});

function addEvent() {
    const defaultEvent = {
        type: '',
        field: '',
        params: {}
    };
    const value:any = {};
    for (const eventName of eventKey.value) {
        if (!props.value[eventName]) {
            value[eventName] = [defaultEvent];
        } else {
            value[eventName] = props.value[eventName];
        }
    }
    changeHandler(value);
}

function changeHandler(value: any) {
    emits('change', value);
    emits('blur', value);
    emits('update:value', value);
}

function confirmEvent() {
    changeHandler(props.value);
    showFooter.value = false;
}

function addEventUni(key: string) {
    // eslint-disable-next-line
    props.value[key]?.push({
        type: '',
        field: '',
        params: {}
    });
    showFooter.value = true;
}
function removeEventUni(arr: any[], index: number) {
    arr.splice(index, 1);
}

function selectComp(item:any) {
    item.field = '';
    item.event = '';
}
function getCompEventSelect(item:any) {
    if (!item) return [];
    const key = item.split('&&&')[0] || '';
    const eventKey = key[0].toUpperCase() + key.slice(1);
    return service?.propsService.getConfig('methods')[eventKey]?.methods || [];
}

function resetEventUni(item: any) {
    item.params = {};
    item.field = {};
    showFooter.value = true;
}

function selectCompEvent(item:any) {
    if (!item.comp || !item.event) {
        return;
    }
    const key = item.comp.split('&&&')[1] || '';
    item.field = key + ':' + item.event;
    showFooter.value = true;
}

const paramsData = ref<any>([]);

function selectDsEvent(item:any) {
    if (!item.field) {
        return;
    }
    paramsData.value = [];
    const id = item.field.split(':')[0];
    if (id === 'http') {
        return;
    }
    const name = item.field.split(':')[1];
    const list = service?.editorService.get('root')?.dataSources || [];
    item.params = {};
    for (const child of list) {
        if (child.id === id) {
            if (isArray(child.methods)) {
                for (const sub of child.methods) {
                    if (sub.name === name) {
                        for (const tri of (sub.params || [])) {
                            paramsData.value.push({label: tri.description, value: tri.name});
                            item.params[tri.name] = '';
                        }
                        break;
                    }
                }
            }
        }
    }
    showFooter.value = true;
}

</script>
<style lang='scss' scoped>
.q-editor-event-select {
    width: 100%;
    .select-input {
        width: 100%
    }
    &-content {
        margin: 6px 0;
        border: 1px solid #e8e8e8;
        border-radius: 5px;
        padding: 0 5px;
        &-title {
            display: flex;
            justify-content: space-between;
            font-weight: 500;
        }
        &-uni {
            border: 1px solid #e8e8e8;
            border-radius: 5px;
            padding: 5px;
            &-title {
                font-weight: 500;
                display: flex;
                justify-content: space-between;
            }
            &-params {
                .input {
                    width: 200px;
                }
            }
        }
        &-footer {
            margin: 4px 0;
            text-align: right;
        }
    }
}
[data-theme='dark'] {
    .q-editor-event-select {
        &-content {
            border: 1px solid #303030;
            &-uni {
                border: 1px solid #303030;
            }
        }
    }
}
</style>
