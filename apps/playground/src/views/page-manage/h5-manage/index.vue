<!-- 管理页面 -->
<template>
    <div>
        <a-card>
            <a-button @click="addProject">新建项目</a-button>
        </a-card>
        <q-antd-table class="g-mt" @register="registerTable">
            <template #bodyCell="{column, record}">
                <template v-if="column.dataIndex === 'pageJson'">
                    <a-button type="link" size="small" :title="record.pageJson" @click="openPreviewModal(record)">查看</a-button>
                </template>
                <template v-if="column.dataIndex === 'action'">
                    <q-antd-table-action :actions="createTableActions(record)"></q-antd-table-action>
                </template>
            </template>
        </q-antd-table>
        <add :selectObj="selectObj" :visible="addVisible" @ok="addOk" @cancel="addCancel"></add>
        <JsonViewerModal v-model:visible="previewVisible" :data="previewData"></JsonViewerModal>
    </div>
</template>

<script lang='ts' setup>
import { useGo } from '@quantum-design/hooks/vue/use-page';
import {ActionItem, useTable} from '@quantum-design/vue3-antd-pc-ui'
import {apiGetH5ManageList, apiGetAppList} from '@/http/api/manage/h5-manage'
import { IH5ManageList } from '@/http/api/manage/h5-manage/interface';
import Add from './components/add.vue'
import { ref } from 'vue';
import { JsonViewerModal } from '@/components/json-viewer';
import { parseSchemas } from '@quantum-lowcode/utils';

defineOptions({
     name: 'H5Manage'
})
const go = useGo();
const addVisible = ref(false)
const previewVisible = ref(false)
const previewData = ref({});
const selectObj = ref({})
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
                    runtimePathType: 'vue2',
                    id: record.id
                }
            })
        }
    }, {
        label: '预览',
        onClick: async() => {
            window.open(`https://front-ssg-platform.qmniu.com/api/low-code/preview?id=${record.id}`)
        }
    }]
}

function openPreviewModal(record: IH5ManageList) {
    previewVisible.value = true;
    previewData.value = record.pageJson ? (parseSchemas(record.pageJson)) : {}
}

async function initSelect() {
    const res = await apiGetAppList();
    if (res.code ===200) {
        selectObj.value = res.data
    }
}
initSelect()

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