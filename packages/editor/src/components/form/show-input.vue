<!-- ifShow逻辑更改  -->
<template>
    <div>
        <q-antd-table @register="registerTable">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'custum'">
                    <template v-if="record.editable">
                        <template v-if="['between', 'not_between'].includes(record.op)">
                            <a-input-number v-model:value="record.range[0]" /> - 
                            <a-input-number v-model:value="record.range[1]" /> - 
                        </template>
                        <template v-else-if="record.type === 'number'">
                            <a-input-number v-model:value="record.value" />
                        </template>
                        <template v-else-if="record.type === 'boolean'">
                            <a-select v-model:value="record.value" :options="[{label: '是', value: true},{label: '否', value: false}]"></a-select>
                        </template>
                        <template v-else>
                            <a-input v-model:value="record.value" />
                        </template>
                    </template>
                    <template v-else>
                        {{ (record.value?.toString() || '') + '' +(record.range?.toString() || '')}}
                    </template>
                </template>
                <template v-if="column.key === 'action'">
                    <q-antd-table-action :actions="createActions(record)" />
                </template>
            </template>
        </q-antd-table>
        <div> <a-button size="small" type="link" @click="updateData">添加</a-button></div>
    </div>
</template>

<script lang='ts' setup>
import { useTable, addTableEditComp } from '@q-front-npm/vue3-antd-pc-ui';
import { IServices } from '../../types';
import { computed, inject, nextTick, unref } from 'vue';
import {Cascader} from 'ant-design-vue'
import { arrayOptions, eqOptions, numberOptions } from '../../utils/props';
import { cloneDeep } from 'lodash-es';
import { js_utils_get_uuid } from '@qimao/quantum-utils';
import { IfShow } from '@qimao/quantum-schemas';
defineOptions({
    name: 'ShowInput'
})
const props = withDefaults(
    defineProps<{
        value: Partial<IfShow & {id: string}>[];
    }>(),
    {
        value: [],
    }
);
const emits = defineEmits(['change','update:value', 'blur']);
const service = inject<IServices>('services');

const getDataSourceProps = computed(() => {
    const data = cloneDeep(props.value)
    return data.map(item => {
        if (!item.id) {
            item.id = js_utils_get_uuid(4)
        }
        return item
    })
})

const getDsSelect = computed(() => {
    return service?.editorService.get('root')?.dataSources?.map(ds => {
        return {
            label: `${ds.title || ''}(${ds.id})`,
            value: ds.id,
            children: ds.fields.map((method: any) => {
                return {
                    label: method.title || method.name,
                    value: `${method.name}`,
                }
            })
        }
    })
});

addTableEditComp('Cascader', Cascader)
const [registerTable, {getDataSource, deleteTableDataRecord}] = useTable({
    pagination: false,
    rowKey: 'id',
    dataSource: getDataSourceProps,
    resizable: false,
    tableSetting: {},
    actionColumn: {
        width: 80
    },
    columns: [
        {
            title: '字段',
            key: 'field',
            dataIndex: 'field',
            align: 'center',
            width: 70,
            editRow: true,
            editRule: true,
            editComponent: 'Cascader',
            editComponentProps: ({text, record, column, index}) => {
                return {
                    options: getDsSelect.value,
                    onChange: () => {
                        record.op = '';
                        record.value = null;
                        record.range = []
                    }
                }
            },
        },
        {
            title: '条件',
            key: 'op',
            dataIndex: 'op',
            editRow: true,
            editComponent: 'Select',
            editRule: true,
            width: 50,
            editComponentProps: ({text, record, column, index}) => {
                const [sid, fid] = record.field;
                const ds = service?.dataSourceService?.getDataSourceById(sid);
                let curData = ds?.fields.find((item) => item.name === fid);
                record.type = curData?.type
                let options: any[] = [];
                if (curData?.type === 'number' ) {
                    options = [...eqOptions, ...numberOptions];
                } else if (curData?.type === 'array') {
                    options = [...arrayOptions];
                } else if (curData?.type === 'boolean') {
                    options = [{ label: '是', value: 'is' }, { label: '不是', value: 'not' },];
                } else if (curData?.type === 'string') {
                    options = [...arrayOptions, ...eqOptions]
                } else {
                    options = [...arrayOptions, ...eqOptions, ...numberOptions]
                }
                return {
                    options
                }
            },

        },
        {
            title: '值',
            key: 'custum',
            dataIndex: 'custum',
            align: 'left',
            editRow: true,
            width: 70
        }
    ],
    canResize: false,
});

function updateData(data?: any) {
    const dataSource = getDataSource().map(item => unref(item.editValueRefs));
    if (data) {
        dataSource.push({
            id: js_utils_get_uuid(4),
            field: [],
            range: [],
            value: null,
            op:''
        });
    }
    console.log(dataSource)
    emits('update:value', dataSource)
    emits('change', dataSource)
    emits('blur', dataSource)
}

function createActions(record: any) {
    if (!record.editable) {
        return [
            {
                label: '编辑',
                onClick: () => {
                    record.editValueRefs.value = record.value
                    record.editValueRefs.range = record.range
                    record.onEdit();
                },
            },
            {
                label: '删除',
                popConfirm: {
                    title: '是否删除数据',
                    confirm: () => {
                        deleteTableDataRecord(record.id);
                        nextTick(() => updateData())
                    },
                },
            }
        ];
    }
    return [
        {
            label: '保存',
            onClick: () => {
                record.editValueRefs.value = record.value
                record.editValueRefs.range = record.range
                record.onSubmit();
                nextTick(() => updateData())
            },
        },
        {
            label: '取消',
            popConfirm: {
                title: '是否取消编辑',
                confirm: () => {
                    record.value = record.editValueRefs.value
                    record.range = record.editValueRefs.range
                    if (!record.field) {
                        deleteTableDataRecord(record.id);
                    }
                    record.onCancel();
                },
            },
        }
    ];
}
</script>
<style lang='scss' scoped>
</style>
