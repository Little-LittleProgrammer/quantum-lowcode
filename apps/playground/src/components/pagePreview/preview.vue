<!--  -->
<template>
    <a-modal v-model:open="proxyVisible" title="预览" :footer="null" :width="sandboxRect.width + 48">
        <iframe ref="previewRef" :src="previewUrl" width="100%" :height="sandboxRect.height" v-if="previewVisible"></iframe>
    </a-modal>
</template>

<script lang='ts' setup>
import {computed, ref, watch, watchEffect} from 'vue';
defineOptions({
     name: 'preview'
}) 

const props = withDefaults(defineProps<{
    previewVisible: boolean;
    sandboxRect: Record<'width' | 'height', number>;
    previewUrl: string;
    uaInfo: string;
    designWidth: number;
}>(), {
    previewVisible: false,
    sandboxRect: { width: 375, height: 817 },
    previewUrl: '',
    uaInfo: '',
    designWidth: 720
})
const previewRef = ref()

const emit = defineEmits(['update:previewVisible']);

watchEffect(() => {
    if (props.uaInfo && previewRef.value) {
        setTimeout(() => {
            const app = (previewRef.value.contentWindow as any).appInstance;
            app.setEnv(props.uaInfo);
            app.setDesignWidth(props.designWidth);
        },500)
    }
},)

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