<!--  -->
<template>
    <a-tabs size="small" type="card" :active-key="page && page.field" @change="switch_page">
        <tab-pane 
            v-for="item in (root && root.children) || []"
            :key="item.field"
            :tab="item.field"
        ></tab-pane>
    </a-tabs>
</template>

<script lang='ts' setup>
import { IServices } from '../../types';
import { computed, inject } from 'vue'
import {Tabs as ATabs, TabPane} from 'ant-design-vue'
defineOptions({
     name: 'QEditorPageBar'
})

const services = inject<IServices>('services');
const editorService = services?.editorService;

const root = computed(() => editorService?.get('root'));

const page = computed(() => editorService?.get('page'));

function switch_page(key: string) {
    editorService?.select(key);
}

</script>
<style lang='scss' scoped>
</style>