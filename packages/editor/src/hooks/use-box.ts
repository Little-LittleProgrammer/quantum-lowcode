import { BoxCore, GuidesType } from '@quantum-lowcode/sandbox';
import { editorService } from '../services/editor-service';
import { uiService } from '../services/ui-service';
import { computed, watch } from 'vue';
import { UI_SELECT_MODE_EVENT_NAME, IBoxOptions } from '../types';
import { IRemoveEventData, IUpdateEventData } from '@quantum-lowcode/sandbox/src/types';
import { ISchemasNode } from '@quantum-lowcode/schemas';
import { H_GUIDE_LINE_STORAGE_KEY, V_GUIDE_LINE_STORAGE_KEY } from '../utils/const';
import { getGuideLineFromCache } from '../utils/editor';

const root = computed(() => editorService.get('root'));
const page = computed(() => editorService.get('page'));
const zoom = computed(() => uiService.get('zoom') || 1);
const uiSelectMode = computed(() => uiService.get('uiSelectMode'));

const getGuideLineKey = (key: string) => `${key}_${root.value?.field}_${page.value?.field}`;

export function useBox(boxOptions: IBoxOptions) {
    const sandbox = new BoxCore({
        runtimeUrl: boxOptions.runtimeUrl,
        zoom: zoom.value,
        autoScrollIntoView: boxOptions.autoScrollIntoView,
        isContainer: boxOptions.isContainer,
        containerHighlightClassName: boxOptions.containerHighlightClassName,
        containerHighlightDuration: boxOptions.containerHighlightDuration,
        containerHighlightType: boxOptions.containerHighlightType,
        disabledDragStart: boxOptions.disabledDragStart,
        canSelect: (el, event, stop) => {
            if (!boxOptions.canSelect) return true;

            const elCanSelect = boxOptions.canSelect?.(el);
            // 在组件联动过程中不能再往下选择，返回并触发 ui-select
            if (uiSelectMode.value && elCanSelect && event.type === 'mousedown') {
                document.dispatchEvent(new CustomEvent(UI_SELECT_MODE_EVENT_NAME, { detail: el }));
                return stop();
            }

            return elCanSelect;
        },
        moveableOptions: boxOptions.moveableOptions,
        updateDragEl: boxOptions.updateDragEl,
        guidesOptions: boxOptions.guidesOptions,
        disabledMultiSelect: boxOptions.disabledMultiSelect,
        designWidth: editorService.get('root')?.designWidth
    });
    watch(() => editorService.get('disabledMultiSelect'), (val) => {
        if (val) {
            sandbox.disableMultiSelect();
        } else {
            sandbox.enableMultiSelect();
        }
    });

    sandbox.mask.setGuides([
        getGuideLineFromCache(getGuideLineKey(H_GUIDE_LINE_STORAGE_KEY)),
        getGuideLineFromCache(getGuideLineKey(V_GUIDE_LINE_STORAGE_KEY))
    ]);

    sandbox.on('select', (el:HTMLElement) => {
        if (`${editorService.get('node')?.field}` === el.id && editorService.get('nodes')?.length === 1) return;
        editorService.select(el.id);
    });

    sandbox.on('highlight', (el: HTMLElement) => {
        editorService.highlight(el.id);
    });

    sandbox.on('multi-select', (els: HTMLElement[]) => {
        editorService.multiSelect(els.map((el) => el.id));
    });

    sandbox.on('update', (ev: IUpdateEventData) => {
        console.log('sandbox emit update', ev);
        if (ev.parentEl) {
            for (const data of ev.data) {
                editorService.moveToContainer({ field: data.el.id, style: data.style }, ev.parentEl.id);
            }
            return;
        }
        editorService.update(ev.data.map((data) => ({ field: data.el.id, style: data.style } as ISchemasNode)));
    });

    sandbox.on('sort', (ev) => {
        editorService.sort(ev.src, ev.dist);
    });

    sandbox.on('remove', (ev: IRemoveEventData) => {
        const nodes = ev.data.map(({ el }) => editorService.getNodeByField(el.id));
        editorService.delete(nodes.filter((node) => Boolean(node)) as ISchemasNode[]);
    });

    sandbox.on('select-parent', () => {
        const parent = editorService.get('parent');
        if (!parent) throw new Error('父节点为空');
        editorService.select(parent);
        editorService.get('sandbox')?.select(parent.field);
    });

    sandbox.on('change-guides', (e) => {
        console.log('sandbox emit change-guides', e);
        uiService.set('showGuides', true);

        if (!root.value || !page.value) return;

        const storageKey = getGuideLineKey(
            e.type === GuidesType.HORIZONTAL ? H_GUIDE_LINE_STORAGE_KEY : V_GUIDE_LINE_STORAGE_KEY
        );
        if (e.guides.length) {
            globalThis.localStorage.setItem(storageKey, JSON.stringify(e.guides));
        } else {
            globalThis.localStorage.removeItem(storageKey);
        }
    });

    return sandbox;
}
