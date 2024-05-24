<!--  -->
<template>
    <div class="q-editor-data-source">
        <div class="q-editor-data-source-header">
            <a-input-search
                v-model:value="searchText"
                placeholder="模糊搜索"
                style="width: 200px"
            />
            <a-popover >
                <template #content>
                    <a-button v-for="item in datasourceTypeList" :key="item.value" size="small" type="link" @click="addDataSource(item.value)">
                        {{item.label}}
                    </a-button>
                </template>
                <a-button type="primary">添加</a-button>
            </a-popover>
        </div>
        <div class="q-editor-data-source-body">
            <a-tree :treeData="dataSourceList">
                <template #title="{ title, key }">
                    <div v-if="key.startsWith('root')" class="q-editor-data-source-body-title">
                        <span  >{{ title }}</span>
                        <div>
                            <a-button type="link" size="small" @click="deleteDataSource(key)">
                                <template #icon>
                                    <q-antd-icon type="DeleteOutlined"></q-antd-icon>
                                </template>
                            </a-button>
                            <a-button type="link" size="small" @click="EditDataSource(key)">
                                <template #icon>
                                    <q-antd-icon type="EditOutlined"></q-antd-icon>
                                </template>
                            </a-button>
                        </div>
                    </div>
                    <span v-else>{{ title }}</span>
                </template>
            </a-tree>
        </div>
        <data-edit @register="registerDrawer"></data-edit>
    </div>
</template>

<script lang='ts' setup>
import { IDataSourceSchema } from '@quantum-lowcode/schemas';
import { isArray } from '@quantum-lowcode/utils';
import { IServices } from '../../../../types';
import { computed, inject, ref } from 'vue';
import {Modal} from 'ant-design-vue';
import { useDrawer } from '@quantum-design/vue3-antd-pc-ui';
import DataEdit from './data-edit.vue';

defineOptions({
    name: 'DataSource',
});

const { editorService, dataSourceService, } = inject<IServices>('services') || {};

const dataSources = computed(() => dataSourceService?.get('dataSources') || []);

const searchText = ref();

const datasourceTypeList = computed(() =>
    [
        { label: '基础', value: 'base', },
        { label: 'HTTP', value: 'http', }
    ].concat(dataSourceService?.get('datasourceTypeList') ?? [])
);

function formatTree(type: 'fields' | 'methods', ds: IDataSourceSchema) {
    if (isArray(ds[type]) && ds[type].length > 0) {
        const enums = {
            fields: '数据',
            methods: '方法',
        };
        const obj = {
            title: enums[type],
            key: type,
            children: ds[type].map((f) => {
                return {
                    title: (f.title ?? '') + `(${f.name})`,
                    key: f.name,
                };
            }),
        };
        return obj;
    }
    return;
}

const dataSourceList = computed(() => {
    return dataSources.value.map((ds) => {
        const children = [];
        const fields = formatTree('fields', ds);
        const methods = formatTree('methods', ds);
        if (fields) {
            children.push(fields);
        }
        if (methods) {
            children.push(methods);
        }
        return {
            title: ds.title + `(${ds.id})`,
            key: 'root' + ds.id,
            children,
        };
    });
});

function addDataSource(type: string) {
    openDrawer(true, {
        type,
    });
}
function EditDataSource(key: string) {
    const realKey = key.replace('root', '');
    openDrawer(true, {
        key: realKey,
    });
}
function deleteDataSource(key: string) {
    const realKey = key.replace('root', '');
    Modal.confirm({
        title: '是否删除此条数据',
        onOk: () => {
            dataSourceService?.delete(realKey);
        },
    });
}

const [registerDrawer, {openDrawer, }] = useDrawer();

</script>
<style lang='scss' scoped>
.q-editor-data-source {
    padding: 10px;
    &-body {
        padding: 10px 0;
        &-title {
            display: flex;
            width: 200px;
            justify-content: space-between;
        }
    }
}
</style>
