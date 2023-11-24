<!-- 画布 -->
<template>
    <div ref="boxContainer" class="q-sandbox-container" :style="getBoxStyle"></div>
</template>

<script lang='ts' setup>
import {  watchEffect,toRaw, inject, computed, markRaw, ref, watch, onUnmounted, nextTick } from 'vue'
import { BoxCore, IBoxCoreConfig } from '@qimao/quantum-sandbox';
import { IServices } from '../../types';
import { IRuntime } from '@qimao/quantum-sandbox/src/types';
import { cloneDeep } from 'lodash-es';

defineOptions({
    name: 'QEditorSandBox'
})
// const props = defineProps({
    
// })
let sandbox: BoxCore | null = null;
let runtime: IRuntime | null = null;

const services = inject<IServices>('services');
const sandboxOptions = inject<IBoxCoreConfig>('sandboxOptions');
const root = computed(() => services?.editorService.get('root'));
const page = computed(() => services?.editorService.get('page'));
const boxRect = computed(() => services?.uiService.get('sandboxRect'));

const boxContainer = ref<HTMLDivElement | null>()

watchEffect(() => {
    if (sandbox) return;

    if (!boxContainer.value) return 
    if (!sandboxOptions?.runtimeUrl || !root.value) return;
    sandbox = new BoxCore(sandboxOptions);

    services?.editorService.set('sandbox', markRaw(sandbox));

    sandbox?.mount(boxContainer.value);
    console.log(111)
    sandbox.on('runtime-ready', (rt: IRuntime) => {
        runtime = rt;
        // toRaw返回的值是一个引用而非快照，需要cloneDeep
        root.value && runtime?.updateRootConfig?.(cloneDeep(toRaw(root.value)));
        page.value?.id && runtime?.updatePageId?.(page.value.id);
    })
})

const getBoxStyle = computed(() => {
    return {
        width: boxRect.value?.width || 0 + 'px',
        height: boxRect.value?.height || 0 + 'px'
    }
})

watch(root, (root) => {
  if (runtime && root) {
    runtime.updateRootConfig?.(cloneDeep(toRaw(root)));
  }
});

watch(page, (page) => {
  if (runtime && page) {
    // 直接更新页面
    runtime.updatePageId?.(page.id);
    nextTick(() => {
      sandbox?.select(page.id);
    });
  }
});

onUnmounted(() => {
    sandbox?.destory();
    services?.editorService.set('sandbox', null)
})

</script>
<style lang='scss' scoped>
.q-sandbox-container {
    width: 100%;
    height: 100%;
    z-index: 0;
    position: relative;
    transition: transform 0.3s;
    box-sizing: content-box;
    box-shadow: rgba(0, 0, 0, 0.04) 0px 3px 5px;
    background-color: #fff;

}

</style>