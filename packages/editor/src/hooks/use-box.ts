import { BoxCore } from '@qimao/quantum-sandbox';
import { editorService } from '../services/editor-service';
import { uiService } from '../services/ui-service';
import { computed, watch } from 'vue';
import { UI_SELECT_MODE_EVENT_NAME, IBoxOptions } from '../types';
import { IUpdateEventData } from '@qimao/quantum-sandbox/src/types';

const root = computed(() => editorService.get('root'));
const page = computed(() => editorService.get('page'));
const zoom = computed(() => uiService.get('zoom') || 1);
const uiSelectMode = computed(() => uiService.get('uiSelectMode'));

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
                document.dispatchEvent(new CustomEvent(UI_SELECT_MODE_EVENT_NAME, { detail: el, }));
                return stop();
            }

            return elCanSelect;
        },
        moveableOptions: boxOptions.moveableOptions,
        updateDragEl: boxOptions.updateDragEl,
        guidesOptions: boxOptions.guidesOptions,
        disabledMultiSelect: boxOptions.disabledMultiSelect,
    });
    watch(() => editorService.get('disabledMultiSelect'), (val) => {
        if (val) {
            sandbox.disableMultiSelect();
        } else {
            sandbox.enableMultiSelect();
        }
    });

    sandbox.mask.setGuides([
        // getGuideLineFromCache(getGuideLineKey(H_GUIDE_LINE_STORAGE_KEY)),
        // getGuideLineFromCache(getGuideLineKey(V_GUIDE_LINE_STORAGE_KEY)),
    ]);

    sandbox.on('select', (el:HTMLElement) => {
        if (`${editorService.get('node')?.field}` === el.id && editorService.get('nodes')?.length === 1) return;
        editorService.select(el.id);
    });

    sandbox.on('highlight', (el: HTMLElement) => {
        editorService.highlight(el.id);
    });

    // sandbox.on('multi-select', (els: HTMLElement[]) => {
    //     editorService.multiSelect(els.map((el) => el.id));
    // });
    sandbox.on('update', (ev: IUpdateEventData) => {
        if (ev.parentEl) {
            for (const data of ev.data) {
                editorService.moveToContainer({ id: data.el.id, style: data.style, }, ev.parentEl.id);
            }
            return;
        }
        editorService.update(ev.data.map((data) => ({ id: data.el.id, style: data.style, })));
    });

    return sandbox;
}
