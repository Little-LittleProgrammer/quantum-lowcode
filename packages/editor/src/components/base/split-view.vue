<!-- 画面切割 -->
<template>
    <div class="q-editor-layout">
        <div class="q-editor-layout-left" :style="getLeftStyle">
            <slot name="left"></slot>
        </div>
        <template v-if="center">
            <div class="q-editor-layout-center" :style="getCenterStyle">
                <slot name="center"></slot>
            </div>
        </template>
        <template v-if="right">
            <div class="q-editor-layout-right" :style="getRightStyle">
                <slot name="right"></slot>
            </div>
        </template>
    </div>
</template>

<script lang='ts' setup>
import { computed } from 'vue';
defineOptions({
    name: 'QEditorSplitView',
});
const props = withDefaults(
    defineProps<{
        left?: number,
        right?: number,
        center?:number
    }>(),
    {
        left: 0,
        center: 600,
        right: 1,
    }
);

const getLeftStyle = computed(() => {
    if (props.left === 1) {
        return { flex: 1, };
    }
    return {width: props.left + 'px', };
});
const getCenterStyle = computed(() => {
    if (props.center === 1) {
        return { flex: 1, };
    }
    return {width: props.center + 'px', };
});
const getRightStyle = computed(() => {
    if (props.right === 1) {
        return { flex: 1, };
    }
    return {width: props.right + 'px', };
});

</script>
<style lang='scss' scoped>
.q-editor-layout {
    width: 100%;
    display: flex;
    justify-self: space-between;
    &-left {
        // transition: all .3s;clear
        overflow-x: hidden;
        border-right: 1px solid #e8e8e8;
    }
}
[data-theme='dark'] {
    .q-editor-layout  {
        &-left {
            border-right: 1px solid #303030;
        }

    }
}
</style>
