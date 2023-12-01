<!-- 管理页面 -->
<template>
    <div>
        <a-card>
            <a-button @click="addProject">新建项目</a-button>
        </a-card>
        <q-antd-table class="g-mt" @register="registerTable">
            <template #bodyCell="{column, record}">
                <template v-if="column.dataIndex === 'action'">
                    <q-antd-table-action :actions="createTableActions(record)"></q-antd-table-action>
                </template>
            </template>
        </q-antd-table>
        <add :visible="addVisible" @ok="addOk" @cancel="addCancel"></add>
    </div>
</template>

<script lang='ts' setup>
import { useGo } from '@q-front-npm/hooks/vue/use-page';
import {ActionItem, useTable} from '@q-front-npm/vue3-antd-pc-ui'
import {apiGetH5ManageList, apiPreviewH5ManageProject} from '@/http/api/manage/h5-manage'
import { IH5ManageList } from '@/http/api/manage/h5-manage/interface';
import Add from './components/add.vue'
import { ref } from 'vue';

defineOptions({
     name: 'H5Manage'
})
const go = useGo();
const addVisible = ref()
function addProject() {
    addVisible.value = true
}

function addOk() {
    addVisible.value =false;
    reload()
}
function addCancel() {
    addVisible.value =false;
}

function createTableActions(record: IH5ManageList):ActionItem[] {
    return [{
        label: '编辑',
        onClick: () => {
            go({
                path: '/backend/editor/editor-page',
                query: {
                    runtimePathType: 'active',
                    id: record.id
                }
            })
        }
    }, {
        label: '预览',
        onClick: async() => {
            const _res = await apiPreviewH5ManageProject({id: record.id});
            console.log(_res)
            if (_res.code === 200) {}
        }
    }]
}

const [registerTable, {reload}] = useTable({
    canResize: true,
    title: '项目列表',
    api: apiGetH5ManageList,
    immediate: true,
    ellipsis: false,
    actionColumn: {
        width: 100
    },
    showTableSetting: true,
    autoCreateKey: true,
    fetchSetting: {
        totalField: 'page_data.total',
        headerField: 'table_header'
    }
})

</script>
<style lang='scss' scoped>
</style>