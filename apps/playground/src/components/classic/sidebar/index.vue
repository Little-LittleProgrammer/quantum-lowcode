<!--  -->
<template>
    <div class="classic-sidebar">
        <comp-list @add="addComp"></comp-list>
        <props-list :isAdd="cnt"></props-list>
    </div>
</template>

<script lang='ts' setup>
import { IServices } from '@quantum-lowcode/editor';
import { PropType, provide, reactive, ref } from 'vue'
import CompList from './comp-list/index.vue'
import PropsList from './props-list/index.vue'
defineOptions({
     name: 'Sidebar'
});
const props = defineProps({
    services: {
        type: Object as PropType<IServices>,
        default: () => {}
    }
})
provide('services', props.services);

const cnt = ref(0)
function addComp() {
    cnt.value++
}

</script>
<style lang='scss' scoped>
.classic-sidebar {
    height: 100%;
    overflow-y: auto;
}
</style>