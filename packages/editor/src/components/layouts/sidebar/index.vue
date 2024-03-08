<!-- 左侧菜单栏 -->
<template>
    <div class="q-editor-sidebar">
        <div class="q-editor-sidebar-manu" >
            <div class="q-editor-sidebar-manu-uni" :class="{'active': curKey===item.key}" v-for="(item, index) in sidebarItem" :key="item.key" @click="handleClick(item, index)">
                <q-antd-icon class="q-editor-sidebar-manu-uni-icon" :type="item.icon"></q-antd-icon>
                <p class="q-editor-sidebar-manu-uni-text">{{ item.text }}</p>
            </div>
        </div>
        <div class="q-editor-sidebar-content">
            <component :is="curComp"></component>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { computed, markRaw, reactive, ref } from 'vue';
import ComponentList from './component-list/index.vue';
import DataSource from './data-source/index.vue';
import Layer from './layer/index.vue';
defineOptions({
    name: 'Sidebar',
});

const curKey = ref('component-list');
const curComp = ref(markRaw(ComponentList));

const sidebarItem = computed(() => {
    return [{
        key: 'component-list',
        component: markRaw(ComponentList),
        icon: 'TabletOutlined',
        text: '组件',
    }, {
        key: 'data-source',
        component: markRaw(DataSource),
        icon: 'DatabaseOutlined',
        text: '数据源',
    }, {
        key: 'layer',
        component: markRaw(Layer),
        icon: 'DiffOutlined',
        text: '层级',
    }];
});

function handleClick(item) {
    curKey.value = item.key;
    curComp.value = item.component;
}

</script>
<style lang='scss' scoped>
.q-editor-sidebar {
    font-size: 12px;
    height: 100%;
    text-align: center;
    display: flex;
    &-manu {
        width: 40px;
        min-width: 40px;
        height: 100%;
        background-color: rgba(224,158,42,0.5);
        &-uni {
            font-size: 14px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            height: 70px;
            &.active {
                background-color: #fff;
            }
            &-icon {
                flex: 1;
                font-size: 20px;
            }
            &-text {
                padding-bottom: 5px;
            }
        }
    }
    &-content {
        flex: 1
    }
}
</style>
