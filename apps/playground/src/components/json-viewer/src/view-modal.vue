<!--  -->
<template>
    <a-modal title="json查看" :open="props.visible" :footer="false" @cancel="cancelModal">
        <json-viewer :data="props.data"></json-viewer>
    </a-modal>
</template>

<script lang='ts' setup>
import JsonViewer from './index.vue';
defineOptions({
     name: 'JsonViewerModal'
})
const props = defineProps({
    visible: Boolean,
    data: Object
})
const emit = defineEmits(['update:visible']);

function cancelModal() {
    emit('update:visible', false)
}

</script>
<style lang='scss' scoped>
</style>