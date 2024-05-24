<!--  -->
<template>
    <div>
        <a-tabs size="small" type="card" :active-key="(page && page.field) as string" @change="switchPage">
            <tab-pane
                v-for="item in (root && root.children) || []"
                :key="item.field"
            >
                <template #tab>
                    <q-antd-dropdown :dropMenuList="dropDownList" @menuEvent="(menu) => handleMenuEvent(menu, item)">
                        {{ item.field }}
                    </q-antd-dropdown>
                </template>
            </tab-pane>
            <template #rightExtra>
                <a-button @click="addPage">+</a-button>
            </template>
        </a-tabs>

    </div>
</template>

<script lang='ts' setup>
import { IServices } from '../../../types';
import { computed, inject, ref, toRaw } from 'vue';
import {Tabs as ATabs, TabPane} from 'ant-design-vue';
import { DropMenu } from '@quantum-design/vue3-antd-pc-ui';
import { ISchemasPage, NodeType } from '@quantum-lowcode/schemas';
defineOptions({
    name: 'QEditorPageBar',
});

const services = inject<IServices>('services');
const editorService = services?.editorService;

const root = computed(() => editorService?.get('root'));

const page = computed(() => editorService?.get('page'));

const dropDownList = computed(() => [
    {
        icon: 'CopyOutlined',
        event: 'copy',
        text: '复制',
    },
    {
        icon: 'CloseOutlined',
        event: 'delete',
        text: '删除',
        disabled: (root.value?.children?.length || 0) <= 1,
    }
]);

function handleMenuEvent(menu: DropMenu, item: ISchemasPage): void {
    const { event, } = menu;
    if (event === 'copy') {
        item && editorService?.copy(item);
    } else {
        editorService?.delete(item);
    }
}

function switchPage(key: string) {
    editorService?.select(key);
}

function addPage() {
    if (!editorService) return;
    const root = toRaw(editorService.get('root'));
    if (!root) throw new Error('root 不能为空');
    const pageConfig = {
        type: NodeType.PAGE,
        children: [],
    };
    editorService.add(pageConfig);
}

</script>
<style lang='scss' scoped>
</style>
