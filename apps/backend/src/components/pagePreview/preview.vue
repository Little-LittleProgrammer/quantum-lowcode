<!--  -->
<template>
    <a-modal v-model:open="proxyVisible" title="预览" :footer="null" :width="sandboxRect.width + 48">
        <iframe :src="previewUrl" width="100%" :height="sandboxRect.height" v-if="previewVisible"></iframe>
    </a-modal>
</template>

<script lang='ts' setup>
import {computed} from 'vue';
defineOptions({
     name: 'preview'
})

const props = withDefaults(defineProps<{
    previewVisible: boolean;
    sandboxRect: Record<'width' | 'height', number>;
    previewUrl: string
}>(), {
    previewVisible: false,
    sandboxRect: { width: 375, height: 817 },
    previewUrl: ''
})

const emit = defineEmits(['update:previewVisible']);

const proxyVisible = computed({
    get() {
        return props.previewVisible
    },
    set(val) {
        emit('update:previewVisible', val)
    }
})

</script>
<style lang='scss' scoped>
</style>