<!--  -->
<template>
    <div class="q-editor-layer">
        <div class="q-editor-layer-header">
            <a-input-search v-model:value="searchText" placeholder="模糊搜索" />
        </div>
        <div class="q-editor-layer-body">
            <a-tree
                draggable
                :selectedKeys="selectedKeys"
                :treeData="layerList"
                :fieldNames="fieldNames"
                @select="selectNode"
                @drop="handlerDrop"
            >
                <template #title="{ label, field }">
                    <q-antd-dropdown :trigger="['contextmenu']" :dropMenuList="baseDropMenuList" @menuEvent="handleMenuEvent">
                        <div class="q-editor-layer-body-title">
                            {{ label ?? '' }}({{ field }})
                        </div>
                    </q-antd-dropdown>
                </template>
            </a-tree>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { IServices } from '../../../../types';
import { computed, inject, nextTick, ref } from 'vue';
import {useDrag} from './use-drag';
import { cloneDeep } from 'lodash-es';
import { DropMenu } from '@q-front-npm/vue3-antd-pc-ui';

defineOptions({
    name: 'Layer',
});

const services = inject<IServices>('services');
const page = computed(() => services?.editorService?.get('page'));
const nodes = computed(() => services?.editorService?.get('nodes'));
const node = computed(() => services?.editorService?.get('node'));

const searchText = ref();

const nodeData = computed(() => (!page.value ? [] : [page.value]));

const baseDropMenuList = computed(() => {
    if (node.value) {
        return services?.contentmenuService.getDropMenuList(node.value)
    }
    return []
})

function handleMenuEvent(menu: DropMenu) {
    services?.contentmenuService.handleMenuEvent(menu)
}

const layerList = computed(() => {
    const data = cloneDeep(nodeData.value);
    function dfs(node) {
        if (!node) return;
        if (node.children) {
            node.children.forEach(element => {
                dfs(element);
            });
        }
        node.style = '';
    }
    for (const node of data) {
        dfs(node);
    }
    return data;
});

const selectedKeys = computed(() => {
    return nodes.value?.map((item) => item.field);
});
const fieldNames = {children: 'children', title: 'label', key: 'field', };

async function selectNode(e: string[]) {
    services?.editorService?.select(e[0]);
    await nextTick()
    services?.editorService?.get('sandbox')?.select(e[0]);
}

const {handlerDrop, } = useDrag(services!, nodeData);

</script>
<style lang="scss" scoped>
	.q-editor-layer {
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
