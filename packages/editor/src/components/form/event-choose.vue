<!-- 事件选择
    mounted: {
        hookType: "code",
        hookData: [
            {
                field: "base1:test2",
                params: {
                    a1: "created"
                }
            }
        ]
    },
-->
<template>
    <div class="q-editor-event-select">
        <div class="q-editor-event-select-content">
            <div class="q-editor-event-select-content-title">
                <a-button type="link" size="small" @click="addEventUni">
                    <template #icon>
                        <q-antd-icon type="PlusOutlined"></q-antd-icon>
                    </template>
                </a-button>
            </div>
            <div class="q-editor-event-select-content-uni" v-for="(item, index) in eventData.hookData" :key="index">
                <div class="q-editor-event-select-content-uni-title">
                    <p class="">事件{{ index + 1 }}</p>
                    <a-button type="link" size="small" @click="removeEventUni(index)">
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
                            <a-tree-select v-model:value="item.field" :treeData="getDsSelect"  @change="selectDsEvent(item)"></a-tree-select>
                        </a-form-item>
                        <a-form-item v-if="item.field && paramsData.length" label="参数">
                            <div class="q-editor-event-select-content-uni-params" v-for="c in paramsData">
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
        </div>
    </div>
</template>

<script lang='ts' setup>
import { js_is_array } from '@qimao/quantum-utils';
import { IServices } from '../../types';
import { PropType, computed, inject, ref, watch } from 'vue';
import { Hooks } from '@qimao/quantum-schemas';
defineOptions({
    name: 'EventSelect',
});
const props = defineProps({
    value: {
        type: Object as PropType<Hooks>,
        default: () => ({
            hookType: 'code',
            hookData: []
        }),
    }
});
const emits = defineEmits(['change', 'update:value', 'blur']);

const eventData = ref<Hooks>({});
const uniOptions = [{label: '组件', value: 'component', }, {label: '数据源', value: 'dataSource', }];
const service = inject<IServices>('services');
const page = computed(() => service?.editorService.get('page'));

watch(() => props.value, () => {
    eventData.value = props.value;
}, {immediate: true, });

const getCompSelect = computed(() => {
    return service?.propsService.getMethods(page.value);
});
const getDsSelect = computed(() => {
    return service?.editorService.get('root')?.dataSources?.map(ds => {
        return {
            label: `${ds.title || ''}(${ds.id})`,
            value: ds.type === 'base' ? ds.id : `http:${ds.id}`,
            children: ds.methods.map((method: any) => {
                return {
                    label: method.title || method.name,
                    value: `${ds.id}:${method.name}`,
                }
            })
        }
    })
});

function changeHandler(value: any) {
    emits('change', value);
    emits('blur', value);
    emits('update:value', value);
}

function addEventUni() {
    eventData.value.hookData?.push({
        field: '',
        type: '',
        params: {},
    });
    changeHandler(eventData.value)
}
function removeEventUni(index: number) {
    eventData.value.hookData?.splice(index, 1);
    changeHandler(eventData.value)
}

function selectComp(item:any) {
    item.field = '';
    item.event = '';
}
function getCompEventSelect(item:any) {
    if (!item) return [];
    const key = item.split('&&&')[0] || '';
    const eventData = key[0].toUpperCase() + key.slice(1);
    return service?.propsService.getConfig('methods')[eventData]?.methods || [];
}

function resetEventUni(item: any) {
    item.params = {};
    item.field = {}
}

function selectCompEvent(item:any) {
    if (!item.comp || !item.event) {
        return;
    }
    const key = item.comp.split('&&&')[1] || '';
    item.field = key + ':' + item.event;
}

const paramsData = ref<any>([])

function selectDsEvent(item:any) {
    if (!item.field) {
        return;
    }
    paramsData.value = []
    const id = item.field.split(':')[0]
    if (id === 'http') {
        return
    }
    const name = item.field.split(':')[1];
    const list = service?.editorService.get('root')?.dataSources || []
    item.params = {}
    for (let child of list) {
        if (child.id === id) {
            if (js_is_array(child.methods)) {
                for (let sub of child.methods) {
                    if (sub.name === name) {
                        for (let tri of (sub.params || [])) {
                            paramsData.value.push({label: tri.description, value: tri.name})
                            item.params[tri.name] = ''  
                        }
                        break;
                    }
                }
            }
            
        }
    }
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
