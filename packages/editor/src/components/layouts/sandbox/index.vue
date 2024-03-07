<!-- 画布 -->
<template>
    <div ref="sandboxWrap" class="q-editor-sandbox">
        <q-antd-dropdown :trigger="['contextmenu']" :dropMenuList="baseDropMenuList" @menuEvent="handleMenuEvent">
            <div
                ref="boxContainer"
                class="q-sandbox-container"
                :style="getBoxStyle"
                @drop="dropHandler"
                @dragover="dragoverHandler"
            ></div>
        </q-antd-dropdown>
    </div>
</template>

<script lang="ts" setup>
import {
    watchEffect,
    toRaw,
    inject,
    computed,
    markRaw,
    ref,
    watch,
    onUnmounted,
    nextTick,
    onMounted
} from 'vue';
import { BoxCore } from '@qimao/quantum-sandbox';
import { DragType, IBoxOptions, IServices, Layout } from '../../../types';
import { IRuntime } from '@qimao/quantum-sandbox/src/types';
import { cloneDeep } from 'lodash-es';
import { ISchemasPage, ISchemasRoot } from '@qimao/quantum-schemas';
import { useBox } from '../../../hooks';
import { js_utils_dom_offset, parseSchemas } from '@qimao/quantum-utils';
import { calcValueByDesignWidth } from '@qimao/quantum-sandbox';
import { DropMenu } from '@q-front-npm/vue3-antd-pc-ui';

defineOptions({
    name: 'QEditorSandBox',
});
// const props = defineProps({

// })
let sandbox: BoxCore | null = null;
let runtime: IRuntime | null = null;

const services = inject<IServices>('services');
const boxOptions = inject<IBoxOptions>('boxOptions');

const sandboxWrap = ref<HTMLDivElement>();

const root = computed(
    () => services?.editorService.get('root') as ISchemasRoot
);
const page = computed(() => services?.editorService.get('page'));
const zoom = computed(() => services?.uiService.get('zoom') || 1);
const node = computed(() => services?.editorService.get('node'));
const boxRect = computed(() => services?.uiService.get('sandboxRect'));
const baseDropMenuList = computed(() => {
    if (node.value) {
        return services?.contentmenuService.getDropMenuList(node.value)
    }
    return []
})

// const menu = ref<InstanceType<typeof ViewerMenu>>();

const boxContainer = ref<HTMLDivElement | null>();

function handleMenuEvent(menu: DropMenu) {
    services?.contentmenuService.handleMenuEvent(menu)
}

watchEffect(() => {
    if (sandbox || !page.value) return;

    if (!boxContainer.value) return;
    if (!boxOptions?.runtimeUrl || !root.value) return;
    sandbox = useBox(boxOptions);

    services?.editorService.set('sandbox', markRaw(sandbox));

    sandbox?.mount(boxContainer.value);
    sandbox.on('runtime-ready', (rt: IRuntime) => {
        runtime = rt;
        // toRaw返回的值是一个引用而非快照，需要cloneDeep
        root.value &&
				runtime?.updateRootConfig?.(cloneDeep(toRaw(root.value)));
        page.value?.field && runtime?.updatePageField?.(page.value.field);
        setTimeout(() => {
            node.value && sandbox?.select(toRaw(node.value.field));
        });
    });
});

const getBoxStyle = computed(() => {
    return {
        width: `${boxRect.value?.width || 0}px`,
        height: `${boxRect.value?.height || 0}px`,
        transform: `scale(${zoom.value})`,
    };
});

watch(zoom, (zoom) => {
    if (!sandbox || !zoom) return;
    sandbox.setZoom(zoom);
});

watch(root, (root) => {
    if (runtime && root) {
        runtime.updateRootConfig?.(cloneDeep(toRaw(root)));
    }
});

watch(page, (page) => {
    if (runtime && page) {
        // 直接更新页面
        runtime.updatePageField?.(page.field);
        nextTick(() => {
            sandbox?.select(page.field);
        });
    }
});

const resizeObserver = new ResizeObserver((entries) => {
    for (const { contentRect, } of entries) {
        services?.uiService.set('sandboxContainerRect', {
            width: contentRect.width,
            height: contentRect.height,
        });
    }
});
async function dropHandler(e: DragEvent) {
    if (!e.dataTransfer) return;

    const data = e.dataTransfer.getData('text/json');

    if (!data) return;

    const config = parseSchemas(data);

    if (!config || config.dragType !== DragType.COMPONENT_LIST) return;
    e.preventDefault();

    const doc = sandbox?.renderer.contentWindow?.document;
    const parentEl = doc?.querySelector(`.${boxOptions?.containerHighlightClassName}`);

    let parent = page.value;
    if (parentEl) {
        parent = services?.editorService.getNodeByField(parentEl.id, false) as ISchemasPage;
    }

    if (parent && boxContainer.value && sandbox) {
        const layout = await services?.editorService.getLayout(parent);

        const containerRect = boxContainer.value.getBoundingClientRect();
        const {scrollTop, scrollLeft, } = sandbox.mask;

        const {style = {}, } = config.data;

        let top = 0;
        let left = 0;
        let position = Layout.RELATIVE;

        if (style.position === 'fixed') {
            position = Layout.FIXED;
            top = e.clientY - containerRect.top;
            left = e.clientX - containerRect.left;
        } else if (layout === Layout.ABSOLUTE) {
            position = Layout.ABSOLUTE;

            top = e.clientY - containerRect.top + scrollTop;
            left = e.clientX - containerRect.left + scrollLeft;

            if (parentEl && doc) {
                const {left: parentLeft, top: parentTop, } = js_utils_dom_offset(parentEl as HTMLElement);
                left = left - calcValueByDesignWidth(doc, parentLeft) * zoom.value;
                top = top - calcValueByDesignWidth(doc, parentTop) * zoom.value;
            }
        }

        config.data.style = {
            ...style,
            position,
            top: top / zoom.value,
            left: left / zoom.value,
        };

        config.data.inputEvent = e;

        services?.editorService.add(config.data, parent);
    }
}

function dragoverHandler(e: DragEvent) {
    if (!e.dataTransfer) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

onMounted(() => {
    if (sandboxWrap.value) {
        resizeObserver.observe(sandboxWrap.value);
        // services?.keybindingService.registerEl(KeyBindingContainerKey.STAGE, sandboxWrap.value.container);
    }
});

onUnmounted(() => {
    sandbox?.destory();
    services?.editorService.set('sandbox', null);
});
</script>
<style lang="scss" scoped>
	.q-editor-sandbox {
		padding: 6px;
		height: calc(100% - 36px);
		overflow: auto;
        border: 1px solid #e8e8e8;
		.q-sandbox-container {
			margin: auto;
			width: 100%;
			height: 100%;
			z-index: 0;
			position: relative;
			transition: transform 0.3s;
			box-sizing: content-box;
			box-shadow: 4px 7px 7px 6px rgb(0 0 0 / 15%);
			background-color: #fff;
		}
	}
    [data-theme='dark'] {
        .q-editor-sandbox  {
            border: 1px solid #303030;
        }
    }
</style>
