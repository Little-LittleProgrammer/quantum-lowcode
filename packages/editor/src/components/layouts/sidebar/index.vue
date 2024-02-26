<!-- 左侧菜单栏 -->
<template>
    <div class="q-editor-sidebar">
        <component-list></component-list>
    </div>
</template>

<script lang='ts' setup>
import { computed, reactive } from 'vue';
import ComponentList from './component-list/index.vue';
defineOptions({
    name: 'Sidebar',
});

const sidebarItem = computed(() => {
    return [{
        key: 'component-list',
        component: ComponentList,
        icon: 'TabletOutlined',
        text: '组件',
    }];
});

</script>
<style lang='scss' scoped>
.q-editor-sidebar {
    font-size: 12px;
}
</style>
