<!--  -->
<template>
    <div class="q-editor" ref="refQEditor" style="min-width: 180px">
        <slot name="header"></slot>
        <slot name="nav"></slot>
        <split-view
            class="q-editor-content"
            :left="uiService?.get('workspaceLeft')"
            :center="uiService?.get('workspaceCenter')"
            :right="uiService?.get('workspaceRight')"
        >
            <template #left>
                <slot name="left"></slot>
            </template>
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
                <slot name="code-editor" v-if="showCode">
                    <q-code-editor class="q-editor-content" :value="getDealRoot" :options="codeOptions" @save="save_code"></q-code-editor>
                </slot>
                <slot name="props-editor" v-else></slot>
            </template>
        </split-view>
    </div>
</template>

<script lang='ts' setup>
import { computed, inject } from 'vue';
import splitView from '../base/split-view.vue';
import {getConfig} from '../../utils';
import { Empty } from 'ant-design-vue';
import { serializeToString } from '@quantum-lowcode/utils';
import { ISchemasRoot } from '@quantum-lowcode/schemas';
import { IServices } from '../../types';
defineOptions({
    name: 'QEditorFramework',
});

const codeOptions = inject('codeOptions', {});
const { editorService, uiService, } = inject<IServices>('services') || {};
const root = computed(() => editorService?.get('root') as ISchemasRoot);
const pageLength = computed(() => editorService?.get('pageLength') || 0);
const showCode = computed(() => uiService?.get('showCode'));

const getDealRoot = computed(() => {
    return `export const _schemas: ISchemasRoot=${serializeToString(root.value).replace(/"(\w+)":\s/g, '$1: ')}`;
});

function dealRoot(code: string): string {
    const index = code.indexOf('=');
    return code.slice(index + 1);
}

function save_code(code: string) {
    try {
        const parse = getConfig('parseSchemas');
        const finCode = dealRoot(code);
        editorService?.set('root', finCode ? parse(`(${finCode})`) : '');
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
