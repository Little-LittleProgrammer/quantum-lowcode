<!--  -->
<template>
    <div class="editor-container">
        <div size="small" class="editor-container-header">
            <a-button size="small" @click="openPreviewModal">预览</a-button>
            <a-button size="small">发布</a-button>
        </div>
        <quantum-editor 
            class="editor-container-content"
            ref="editor"
            v-model:value="value"
            :boxRect="sandboxRect"
            :runtime-url="runtimeUrl"
        >
        </quantum-editor>
        <a-modal v-model:visible="previewVisible" title="预览" :footer="null">
            <iframe :src="previewUrl" width="100%" :height="sandboxRect.height" v-if="previewVisible"></iframe>
        </a-modal>
    </div>
</template>

<script lang='ts' setup>
import { computed, reactive, ref, toRaw } from 'vue'
import {QuantumEditor} from '@qimao/quantum-editor'
import { ISchemasRoot } from '@qimao/quantum-core';
import { useMessage } from '@q-front-npm/hooks/vue/use-message';
import { serialize_to_string } from '@qimao/quantum-utils';

defineOptions({ 
     name: 'Editor'
})
const { VITE_RUNTIME_PATH } = import.meta.env;

const runtimeUrl = `${VITE_RUNTIME_PATH}/playground/index.html`;

const editor = ref<InstanceType<typeof QuantumEditor>>();

const value = ref<ISchemasRoot>();

const previewVisible=ref(false)

const previewUrl = computed(
  () => `${VITE_RUNTIME_PATH}/page/index.html?localPreview=1&page=${editor.value?.editorService.get('page')?.field}`,
);

const sandboxRect = reactive({
    width: 375,
    height: 817
})

// const {createConfirm} = useMessage()

function openPreviewModal() {
    // createConfirm({
    //     title: '有修改未保存，是否先保存再预览'
    // })
    save()
    previewVisible.value = true
}

function save() {
    localStorage.setItem('lowCodeSchemas', serialize_to_string(toRaw(value.value)))
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
        height: 90%;
    }
}
</style>