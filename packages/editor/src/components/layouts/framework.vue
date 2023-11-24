<!--  -->
<template>
    <div class="q-editor" ref="refQEditor" style="min-width: 180px">
        <split-view class="q-editor-content">
            <!-- <template #left></template> -->
            <template #center>
                <slot v-if="pageLength > 0" name="workspace"></slot>
                <slot v-else name="empty">
                    <empty class="q-editor-empty">
                        <template #description>
                            <span>请输入配置</span>
                        </template>
                    </empty>
                </slot>
            </template>
            <template #right>
                <slot v-if="showSrc">
                    <q-code-editor class="q-editor-content" :init-values="root" :options="codeOptions" @save="save_code"></q-code-editor>
                </slot>
            </template>
        </split-view>
    </div>
</template>

<script lang='ts' setup>
import { computed, inject, reactive } from 'vue'
import splitView from '../base/split-view.vue';
import { editorService } from '../../services/editor-service';
import { uiService } from '../../services/ui-service';
import {QCodeEditor} from '@qimao/quantum-ui'
import {get_config} from '../../utils'
import { Empty } from 'ant-design-vue';
defineOptions({
     name: 'QEditorFramework'
})

const codeOptions = inject('codeOptions', {})
const root = computed(() => editorService?.get('root'));
const pageLength = computed(() => editorService?.get('pageLength') || 0);
const showSrc = computed(() => uiService?.get('showSrc'));

function save_code(code: string) {
    try {
        const parse = get_config('parseSchemas');
        console.log(code,  parse(code))
        editorService?.set('root', parse(code));
    } catch (e: any) {
        console.error(e);
    }
}
</script>
<style lang='scss'>
.q-editor {
    &-content {
        height: 100%;
    }
    &-empty {
        margin-top: 40px;
    }
}
</style>