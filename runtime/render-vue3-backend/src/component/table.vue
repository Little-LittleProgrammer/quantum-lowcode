<!--  -->
<template>
    <q-table @register="registerTable"></q-table>
</template>

<script lang='ts' setup>
import { reactive } from 'vue';
import {useTable} from '@q-front-npm/vue3-antd-pc-ui'
defineOptions({
     name: 'EditorTable'
})

const [registerTable] = useTable({
    
})

</script>
<style lang='scss' scoped>
</style>