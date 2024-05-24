<!-- 画面切割 -->
<template>
	<div class="q-editor-layout">
		<div class="q-editor-layout-left" :style="getLeftStyle">
			<slot name="left"></slot>
		</div>
		<div
			class="drag-line drag-line-left"
			draggable="true"
			@dragstart="(e) => dragStartHandler(e)"
			@drag="(e) => dragHandler(e, 'left')"
			@dragend="(e) => dragEndHandler(e)"
		></div>
		<template v-if="center">
			<div class="q-editor-layout-center" :style="getCenterStyle">
				<slot name="center"></slot>
			</div>
		</template>
		<div
			class="drag-line drag-line-right"
			draggable="true"
			@dragstart="(e) => dragStartHandler(e)"
			@drag="(e) => dragHandler(e, 'right')"
			@dragend="(e) => dragEndHandler(e)"
		></div>
		<template v-if="right">
			<div class="q-editor-layout-right" :style="getRightStyle">
				<slot name="right"></slot>
			</div>
		</template>
	</div>
</template>

<script lang="ts" setup>
	import {
		js_utils_dom_add_class,
		js_utils_dom_remove_class,
	} from '@quantum-lowcode/utils';
	import { IServices } from '../../types';
	import { computed, inject, onMounted, reactive, ref } from 'vue';
	defineOptions({
		name: 'QEditorSplitView',
	});
	const props = withDefaults(
		defineProps<{
			left?: number;
			right?: number;
			center?: number;
		}>(),
		{
			left: 0,
			center: 600,
			right: 1,
		}
	);
	const { uiService } = inject<IServices>('services') || {};

	const originInfo = reactive({
		x: 0,
		leftWidth: 0,
		centerWidth: 0,
		rightWidth: 0,
	});

	const getLeftStyle = computed(() => {
		if (props.left === 1) {
			return { flex: 1 };
		}
		return { width: props.left + 'px' };
	});
	const getCenterStyle = computed(() => {
		if (props.center === 1) {
			return { flex: 1 };
		}
		return { width: props.center + 'px' };
	});
	const getRightStyle = computed(() => {
		if (props.right === 1) {
			return { flex: 1 };
		}
		return { width: props.right + 'px' };
	});
	function dragStartHandler(e: MouseEvent) {
		js_utils_dom_add_class(e.target, 'dragging');
        var img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='; // 这是一个透明的GIF
        e.dataTransfer.setDragImage(img, 0, 0); // 设置自定义的拖拽影子
		originInfo.x = e.clientX;
		originInfo.leftWidth = props.left;
		originInfo.centerWidth = props.center;
		originInfo.rightWidth = props.right;
	}
	function dragHandler(e: MouseEvent, dire: 'left' | 'right') {
		e.stopPropagation();
		let diff = e.clientX - originInfo.x;
		if (e.clientX !== 0) {
			if (dire === 'left') {
                if (originInfo.centerWidth - diff <=400 || originInfo.centerWidth - diff >=800) {
                    return
                }
				uiService?.set('workspaceLeft', diff + originInfo.leftWidth);
				uiService?.set(
					'workspaceCenter',
					originInfo.centerWidth - diff
				);
			} else {
                if (originInfo.centerWidth + diff <=400 || originInfo.centerWidth + diff >=800) {
                    return
                }
				uiService?.set(
					'workspaceCenter',
					originInfo.centerWidth + diff
				);
			}
		}
	}
	function dragEndHandler(e: MouseEvent) {
		js_utils_dom_remove_class(e.target, 'dragging');
	}
	onMounted(() => {});
</script>
<style lang="scss" scoped>
	.drag-line {
		cursor: ew-resize;
		width: 6px;
		position: relative;
		box-shadow: none;
		&::after {
			background-color: #00000033;
			border-radius: 2px;
			content: '';
			height: 30px;
			left: 50%;
			position: absolute;
			top: 50%;
			transform: translate(-50%, -50%);
			width: 4px;
		}
        &.dragging {
            background-color: #00000033;
			width: 8px;
        }
        &:hover {
            background-color: #00000033;
        }
	}
	.q-editor-layout {
		width: 100%;
		display: flex;
		justify-self: space-between;
		&-left {
			// transition: all .3s;clear
			overflow-x: hidden;
			border-right: 1px solid #e8e8e8;
		}
		&-right {
			border-left: 1px solid #e8e8e8;
		}
	}
	[data-theme='dark'] {
		.q-editor-layout {
			&-left {
				border-right: 1px solid #303030;
			}
		}
	}
</style>
