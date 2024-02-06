import { Subscribe } from '@qimao/quantum-utils';
import { GetTargetElement, IActionManagerConfig } from './types';
import { BoxHighlight } from './box-highlight';
import { Id } from '@qimao/quantum-schemas';

/**
 * 操作管理器
 * 管理mask 之上的操作:
 * 1. 监听鼠标事件, 判断单选、多选、高亮操作;
 * 2. 管理单选(BoxDragResize)、多选(BoxMultiDragResize)、高亮(BoxHighlight)三个类协同工作
 *
 */
export class ActionManager extends Subscribe {
    private highlightLayer: BoxHighlight;
    /** 单选、多选、高亮的容器（蒙层的content） */
    private container: HTMLElement;
    /** 当前选中的节点 */
    private selectedEl: HTMLElement | undefined;

    /** 当前高亮的节点 */
    private highlightedEl: HTMLElement | undefined;
    private getTargetElement: GetTargetElement;

    constructor(config: IActionManagerConfig) {
        super();

        this.getTargetElement = config.getTargetElement;

        this.highlightLayer = new BoxHighlight({
            container: config.container,
            updateDragEl: config.updateDragEl,
            getRootContainer: config.getRootContainer,
        });
    }

    public getSelectedEl(): HTMLElement | undefined {
        return this.selectedEl;
    }

    public getHighlightEl(): HTMLElement | undefined {
        return this.highlightedEl;
    }

    public setHighlightEl(el: HTMLElement | undefined): void {
        this.highlightedEl = el;
    }

    public highlight(idOrEl: Id | HTMLElement) {
        let el;
        try {
            el = this.getTargetElement(idOrEl);
        } catch (error) {
            this.clearHighlight();
            return;
        }

        // 选中组件不高亮、多选拖拽状态不高亮
        if (el === this.getSelectedEl() || this.multiDr?.dragStatus === StageDragStatus.ING) {
            this.clearHighlight();
            return;
        }
    }

    public clearHighlight() {
        this.setHighlightEl(undefined);
        this.highlightLayer.clearHighlight();
    }
}
