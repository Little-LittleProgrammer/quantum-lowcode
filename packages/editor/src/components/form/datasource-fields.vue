<!--  -->
<template>
    <div>
        <q-antd-table @register="registerTable">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'action'">
                    <q-antd-table-action :actions="createActions(record)" />
                </template>
            </template>
        </q-antd-table>
        <div> <a-button size="small" type="link" @click="updateData">添加</a-button></div>
    </div>
</template>

<script lang="ts" setup>
import { useTable } from '@quantum-design/vue3-antd-pc-ui';
import { IDataSchema } from '@quantum-lowcode/schemas';
import { isArray, js_utils_get_uuid } from '@quantum-lowcode/utils';
import { cloneDeep } from 'lodash-es';
import { computed, nextTick, unref } from 'vue';

defineOptions({
    name: 'DataSourceFields',
});

const props = withDefaults(
    defineProps<{
        value: Partial<IDataSchema & {id: string}>[];
    }>(),
    {
        value: [] as any,
    }
);

const emits = defineEmits(['change', 'update:value']);

const getDataSourceProps = computed(() => {
    const data = cloneDeep(props.value);
    return data.map(item => {
        if (!item.id) {
            item.id = js_utils_get_uuid(4);
        }
        return item;
    });
});

const [registerTable, {getDataSource, deleteTableDataRecord, insertTableDataRecord, setTableData, }] = useTable({
    pagination: false,
    rowKey: 'id',
    dataSource: getDataSourceProps,
    resizable: false,
    columns: [
        {
            title: '属性key',
            key: 'name',
            dataIndex: 'name',
            align: 'center',
            sorter: false,
            editRow: true,
            editRule: true,
            width: 100,
        },
        {
            title: '属性名称',
            key: 'title',
            dataIndex: 'title',
            sorter: false,
            editRow: true,
            editComponent: 'Input',
            editRule: true,
            width: 100,
        },
        {
            title: '数据类型',
            key: 'type',
            dataIndex: 'type',
            align: 'center',
            sorter: false,
            editRow: true,
            editComponent: 'Select',
            editComponentProps: {
                options: [
                    { label: '字符串', value: 'string', },
                    { label: '数字', value: 'number', },
                    { label: '布尔值', value: 'boolean', },
                    { label: '对象', value: 'object', },
                    { label: '数组', value: 'array', },
                    { label: 'null', value: 'null', },
                    { label: 'any', value: 'any', }
                ],
            },
            width: 100,
        },
        {
            title: '描述',
            key: 'description',
            dataIndex: 'description',
            align: 'left',
            sorter: false,
            editRow: true,
            editComponent: 'Input',
            width: 250,
        },
        {
            title: '默认值',
            key: 'defaultValue',
            dataIndex: 'defaultValue',
            align: 'center',
            editRow: true,
            sorter: false,
            editComponent: 'Input',
            width: 100,
        }
    ],
    canResize: false,
});

function createActions(record:any) {
    if (!record.editable) {
        return [
            {
                label: '编辑',
                onClick: () => {
                    record.onEdit();
                },
            },
            {
                label: '删除',
                popConfirm: {
                    title: '是否删除数据',
                    confirm: () => {
                        deleteTableDataRecord(record.id);
                        nextTick(() => updateData());
                    },
                },
            }
        ];
    }
    return [
        {
            label: '保存',
            onClick: () => {
                record.onSubmit();
                nextTick(() => updateData());
            },
        },
        {
            label: '取消',
            popConfirm: {
                title: '是否取消编辑',
                confirm: () => {
                    if (!record.name) {
                        deleteTableDataRecord(record.id);
                    }
                    record.onCancel();
                },
            },
        }
    ];
}

function updateData() {
    const dataSource = getDataSource().map(item => unref(item.editValueRefs));
    if (isArray(dataSource) && dataSource.length > 0) {
        insertTableDataRecord({
            id: js_utils_get_uuid(4),
            name: '',
            title: '',
            type: 'string',
            description: '',
            defaultValue: '',
            editable: true,
        });
    } else {
        setTableData([{
            id: js_utils_get_uuid(4),
            name: '',
            title: '',
            type: 'string',
            description: '',
            defaultValue: '',
            editable: true,
        }]);
    }
    const data = getDataSource();
    console.log(data);
    emits('update:value', dataSource);
    emits('change', dataSource);
}

</script>
<style lang="scss" scoped></style>
