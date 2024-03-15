<!--  -->
<template>
    <div class="classic-sidebar">
        <comp-list></comp-list>
        <props-list></props-list>
    </div>
</template>

<script lang='ts' setup>
import { IServices } from '@qimao/quantum-editor';
import { PropType, provide, reactive } from 'vue'
import CompList from './comp-list/index.vue'
import PropsList from './props-list/index.vue'
defineOptions({
     name: 'Sidebar'
})
const props = defineProps({
    services: {
        type: Object as PropType<IServices>,
        default: () => {}
    }
})
provide('services', props.services)

</script>
<style lang='scss' scoped>
.classic-sidebar {
    height: 100%;
    overflow-y: auto;
}
</style>