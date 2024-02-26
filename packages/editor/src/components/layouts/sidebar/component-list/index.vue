<!--  -->
<template>
    <div class="q-editor-component-list">
        <slot name="component-list-header"></slot>
        <div class="q-editor-component-list-search">
            <a-input-search
                v-model:value="searchText"
                placeholder="input search text"
                style="width: 200px"
            />
        </div>
        <div class="q-editor-component-list-content">
            <template v-for="(group, index) in compList" :key="index">
                <divider
                ><q-antd-icon type="AppstoreOutlined" />{{
                    group.text
                }}</divider
                >
                <div class="q-editor-component-list-item-container">
                    <template
                        v-for="item in group.children"
                        :key="item.component"
                    >
                        <div
                            class="q-editor-component-list-item"
                            draggable="true"
                            @click="addComp(item)"
                            @dragstart="dragstartComp(item, $event)"
                            @dragend="dragendComp"
                            @drag="dragComp"
                        >
                            <div class="q-editor-component-list-item-icon">
                                <a-tooltip placement="right" :title="item.desc">
                                    <template v-if="item.icon">
                                        <template v-if="js_is_string(item.icon) && item.icon.startsWith('http')">
                                            <img :src="item.icon" >
                                        </template>
                                        <template v-else-if="js_is_string(item.icon)">
                                            <q-antd-icon :type="item.icon"/>
                                        </template>
                                        <template v-else>
                                            <component :is="toRaw(item.icon)"></component>
                                        </template>
                                    </template>
                                </a-tooltip>
                            </div>
                            <p :title="item.text">{{ item.text }}</p>
                        </div>
                    </template>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { DragType, IBoxOptions, IComponentGroup, IComponentItem, IServices } from '../../../../types';
import { computed, inject, ref, toRaw } from 'vue';
import { Divider } from 'ant-design-vue';
import {js_utils_dom_remove_class, serializeToString} from '@qimao/quantum-utils';

defineOptions({
    name: 'ComponentList',
});
import { js_is_string } from '@qimao/quantum-utils';
import { getCompType } from '../../../../utils';

const services = inject<IServices>('services');
const boxOptions = inject<IBoxOptions>('boxOptions');

const sandbox = computed(() => services?.editorService.get('sandbox'));

const searchText = ref('');

let timeout: NodeJS.Timeout | undefined;
let clientX: number;
let clientY: number;

const compList = computed(() => {
    return services?.componentService
        .getList()
        .map((group: IComponentGroup) => {
            return {
                ...group,
                children: group.children.filter((item) => {
                    return item.text.indexOf(searchText.value) > -1;
                }),
            };
        });
});

function addComp(item: IComponentItem) {
    services?.editorService.add({
        label: item.text,
        type: item.component,
        ...item.data,
    });
}
function dragstartComp(item: IComponentItem, e: DragEvent) {
    e.dataTransfer?.setData('text/json', serializeToString({
        dragType: DragType.COMPONENT_LIST,
        data: {
            label: item.text,
            type: item.component,
            ...item.data,
        },
    }));
}
function dragendComp() {
    console.log('dragend');
    if (timeout) {
        globalThis.clearTimeout(timeout);
        timeout = undefined;
    }
    const doc = sandbox.value?.renderer.getDocument();
    if (doc && boxOptions?.containerHighlightClassName) {
        const el = doc.querySelector(`.${boxOptions.containerHighlightClassName}`);
        if (el) {
            js_utils_dom_remove_class(el, boxOptions.containerHighlightClassName);
        }
    }
    clientX = 0;
    clientY = 0;
}
function dragComp(e:DragEvent) {
    if (e.clientX !== clientX || e.clientY !== clientY) {
        clientX = e.clientX;
        clientY = e.clientY;
        if (timeout){
            globalThis.clearTimeout(timeout);
            timeout = undefined;
        }
        return;
    }

    if (timeout || !sandbox.value) return;

    timeout = sandbox.value.delayedMarkContainer(e);
}
</script>
<style lang="scss" scoped>
.q-editor-component-list {
    padding: 10px;
    &-search {
        text-align: center;
    }
    &-content {
        .q-editor-component-list-item-container {
            padding: 0 10px;
            display: flex;
            flex-wrap: wrap;
            .q-editor-component-list-item {
                display: flex;
                overflow: hidden;
                text-overflow: ellipsis;
                margin: 0px 10px 10px 10px;
                box-sizing: border-box;
                color: #313a40;
                flex-direction: column;
                width: 42px;
                cursor: pointer;
                &-icon {
                    font-size: 20px;
                    background: #fff;
                    height: 40px;
                    width: 40px;
                    line-height: 40px;
                    border-radius: 5px;
                    color: #909090;
                    border: 1px solid #d9dbdd;
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                    margin-bottom: 5px;
                }
                p {
                    text-align: center;
                }
            }
        }
    }
}
</style>
