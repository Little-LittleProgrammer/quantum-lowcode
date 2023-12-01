<!-- 管理页面 -->
<template>
    <div>
        <a-button @click="open_editor_page">新建项目</a-button>
    </div>
</template>

<script lang='ts' setup>
import { useGo } from '@q-front-npm/hooks/vue/use-page';
import { reactive } from 'vue'
defineOptions({
     name: 'H5Manage'
})
const go = useGo()
function open_editor_page() {
    go({
        path: '/backend/editor/editor-page',
        query: {
            runtimePathType: 'vue3'
        }
    })
}

</script>
<style lang='scss' scoped>
</style>