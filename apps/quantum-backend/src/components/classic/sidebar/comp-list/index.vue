<!--  -->
<template>
    <div class="classic-sidebar-comp">
        <a-tabs size="small">
            <a-tab-pane v-for="group in compList" :key="group.text" >
                <template #tab>
                    <template v-if="group.helpMessage">
                        <a-tooltip :title="group.helpMessage">
                            <q-antd-icon type="InfoCircleOutlined" />
                        </a-tooltip>
                    </template>
                    {{group.text}}
                </template>
                <div class="classic-sidebar-comp-tab">
                    <template
                        v-for="item in group.children"
                        :key="item.component"
                    >
                        <div
                            class="classic-sidebar-comp-tab-item"
                            @click="addComp(item)"
                        >
                            <div class="classic-sidebar-comp-tab-item-icon">
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
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script lang='ts' setup>
import { IComponentItem, IServices } from '@qimao/quantum-editor';
import { js_is_string } from '@qimao/quantum-utils';
import { computed, inject, reactive, toRaw } from 'vue'
defineOptions({
    name: 'CompList'
})

const services = inject<IServices>('services');
const compList = computed(() => services?.componentService.getList())

function addComp(item: IComponentItem) {
    const itemType = item.itemType
    const width = services?.editorService?.get('sandbox')?.designWidth;
    if (itemType === 'add') {
        services?.editorService.add({
            label: item.text,
            type: item.component,
            ...{
                ...item.data,
                style: {
                    height: '',
                    width: width
                }
            },
        })
    } else if (itemType === 'cover') {
        services?.editorService.update({
            type: 'root',
            field: 'root',
            ...item.data
        })
    }
    
}

</script>
<style lang='scss' scoped>
.classic-sidebar-comp {
    @include bg-color(aside-bg);
    padding: 0 10px;
    margin: 6px;
    border: 1px solid;
    @include border-color(border-color);
    :deep(.ant-tabs >.ant-tabs-nav) {
        margin-bottom: 8px;
    }
    &-tab {
        display: flex;
        padding: 0 10px;
        flex-wrap: no-wrap;
        overflow-x: auto;
        &-item {
            display: flex;
            overflow: hidden;
            text-overflow: ellipsis;
            margin: 0px 10px 0 0;
            box-sizing: border-box;
            color: #313a40;
            flex-direction: column;
            min-width: 42px;
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
</style>