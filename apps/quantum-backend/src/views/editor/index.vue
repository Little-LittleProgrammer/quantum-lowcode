<!--  -->
<template>
    <div class="editor-container">
        <div size="small" class="editor-container-header">
            <a-button size="small" @click="openPreviewModal">预览</a-button>
            <a-button size="small" @click="saveProject">保存</a-button>
            <a-button size="small" @click="publishProject">发布</a-button>
        </div>
        <quantum-editor 
            class="editor-container-content"
            ref="editor"
            v-model:value="schemas"
            :boxRect="sandboxRect"
            :runtime-url="runtimeUrl"
        >
        </quantum-editor>
        <preview v-model:previewVisible="previewVisible" :previewUrl="previewUrl" :sandboxRect="sandboxRect"></preview>
    </div>
</template>

<script lang='ts' setup>
import { computed, reactive, ref, toRaw, watch } from 'vue'
import {QuantumEditor} from '@qimao/quantum-editor'
import { ISchemasRoot } from '@qimao/quantum-core';
import { serializeToString, parseSchemas } from '@qimao/quantum-utils';
import { testSchemas } from './init-schemas';
import { RUNTIME_PATH } from '@/enums/runtimeEnum';
import { useRoute } from 'vue-router';
import {useMessage} from '@q-front-npm/hooks/vue/use-message'
import { apiGetH5ManageDetail, apiPutH5ManageProject, apiSaveH5ManageProject } from '@/http/api/manage/h5-manage';
import Preview from '@/components/pagePreview/preview.vue'
defineOptions({ 
     name: 'Editor'
})

const route= useRoute()
const {runtimePathType = 'vue3'} = route.query

const runtimeUrl = ref(RUNTIME_PATH[runtimePathType as 'vue3'] + '/playground/index.html');

const editor = ref<InstanceType<typeof QuantumEditor>>();

const schemas = ref<ISchemasRoot>(testSchemas);
let preSchemasStr = ''
let schemasStr = '';
let id = null;

const previewVisible=ref(false)

const previewUrl = computed(
  () => `${RUNTIME_PATH[runtimePathType as 'vue3']}/page/index.html?localPreview=1&page=${editor.value?.editorService.get('page')?.field}`,
);

async function initData() {
    if (route.query.id) {
        id = route.query.id
        const _res = await apiGetH5ManageDetail({id: route.query.id as string});
        if (_res.code === 200) {
            const _json = _res.data.pageJson && parseSchemas(_res.data.pageJson);
            _json.name = _res.data.title;
            schemas.value = _json;
            save();
            preSchemasStr = schemasStr
        }
    } else {
        id = null
    }
}
initData()

const {createConfirm, createMessage} = useMessage()

const sandboxRect = reactive({
    width: 375,
    height: 817
})

// const {createConfirm} = useMessage()

function openPreviewModal() {
    save()
    if (schemasStr !== preSchemasStr) {
        createConfirm({
            title: '有修改未保存，是否先保存再预览',
            onOk: () => {
                saveToNet();
                previewVisible.value = true
            }
        })
    } else {
        previewVisible.value = true
    }
}

function saveProject() {
    save();
    saveToNet();
}

async function publishProject() {
    if (schemasStr !== preSchemasStr){
        createMessage.error('有修改未保存，请先保存再发布');
        return;
    }
    const _res = await apiPutH5ManageProject({id});
    if (_res.code === 200) {
        createMessage.success('发布成功')
    }
}

function save() {
    schemasStr = serializeToString(toRaw(schemas.value))
    localStorage.setItem('PAGE_JSON', schemasStr)
}

async function saveToNet() {
    const _res = await apiSaveH5ManageProject({
        id,
        pageJson: schemasStr
    });
    if (_res.code === 200) {
        createMessage.success('保存成功')
        preSchemasStr = schemasStr;
    }
}

</script>
<style lang='scss'>
.editor-container {
    width: 100%;
    height: 100%;
    @include bg-color(aside-bg);
    &-header {
        height: 32px;
        text-align: right;
        border: 1px solid;
        line-height: 38px;
        @include border-color(border-color)
    }
    &-content {
        border: 1px solid;
        @include border-color(border-color)
    }
    .q-editor {
        flex: 1;
        height: calc(100% - 36px);
    }
}
</style>