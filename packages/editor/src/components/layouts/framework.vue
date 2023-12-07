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
                    <q-code-editor class="q-editor-content" :init-values="getDealRoot" :options="codeOptions" @save="save_code"></q-code-editor>
                </slot>
            </template>
        </split-view>
    </div>
</template>

<script lang='ts' setup>
import { computed, inject } from 'vue';
import splitView from '../base/split-view.vue';
import { editorService } from '../../services/editor-service';
import { uiService } from '../../services/ui-service';
import {QCodeEditor} from '@qimao/quantum-ui';
import {getConfig, getSchemasRootToNeed, setSchemasRoot} from '../../utils';
import { Empty } from 'ant-design-vue';
import { serializeToString } from '@qimao/quantum-utils';
import { ISchemasRoot } from '@qimao/quantum-schemas';
defineOptions({
    name: 'QEditorFramework',
});

const codeOptions = inject('codeOptions', {});
const root = computed(() => editorService?.get('root') as ISchemasRoot);
const pageLength = computed(() => editorService?.get('pageLength') || 0);
const showSrc = computed(() => uiService?.get('showSrc'));

const getDealRoot = computed(() => {
    const values = root.value ? getSchemasRootToNeed(root.value) : [];
    return serializeToString(values).replace(/"(\w+)":\s/g, '$1: ');
});

// function dealRoot(code: string): string {
//     const index = code.indexOf('=');
//     return code.slice(index + 1);
// }

function save_code(code: string) {
    try {
        const parse = getConfig('parseSchemas');
        const finCode = setSchemasRoot(parse(code));
        console.log(finCode);
        editorService?.set('root', finCode || null);
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
