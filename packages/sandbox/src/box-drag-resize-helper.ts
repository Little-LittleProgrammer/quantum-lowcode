import type {
    OnDrag,
    OnDragGroup,
    OnDragGroupStart,
    OnDragStart,
    OnResize,
    OnResizeGroup,
    OnResizeGroupStart,
    OnResizeStart,
    OnRotate,
    OnRotateStart,
    OnScale,
    OnScaleStart
} from 'moveable';
import MoveableHelper from 'moveable-helper';

import { DRAG_EL_ID_PREFIX, GHOST_EL_ID_PREFIX, Mode, ZIndex } from './const';
import { TargetShadow } from './target-shadow';
import type { IDragResizeHelperConfig, IRect, ITargetElement } from './types';
import { getBorderWidth, getMarginValue } from './utils';
import { calcValueByDesignWidth } from '@quantum-lowcode/utils';
import { js_utils_dom_offset, getAbsolutePosition } from '@quantum-lowcode/utils';

/**
 * 拖拽/改变大小等操作发生时，moveable会抛出各种状态事件，DragResizeHelper负责响应这些事件，对目标节点target和拖拽节点targetShadow进行修改；
 * 其中目标节点是DragResizeHelper直接改的，targetShadow作为直接被操作的拖拽框，是调用moveableHelper改的；
 * 有个特殊情况是流式布局下，moveableHelper不支持，targetShadow也是DragResizeHelper直接改的
 */
export default class DragResizeHelper {
    /** 目标节点在蒙层上的占位节点，用于跟鼠标交互，避免鼠标事件直接作用到目标节点 */
    private targetShadow: TargetShadow;
    /** 要操作的原始目标节点 */
    private target!: HTMLElement;
    /** 多选:目标节点组 */
    private targetList: HTMLElement[] = [];
    /** 响应拖拽的状态事件，修改绝对定位布局下targetShadow的dom。
	 * MoveableHelper里面的方法是成员属性，如果DragResizeHelper用继承的方式将无法通过super去调这些方法 */
    private moveableHelper: MoveableHelper;
    /** 流式布局下，目标节点的镜像节点 */
    private ghostEl: HTMLElement | undefined;
    /** 用于记录节点被改变前的位置 */
    private frameSnapShot = {
        left: 0,
        top: 0,
    };
    /** 多选模式下的多个节点 */
    private framesSnapShot: { left: number; top: number; id: string }[] = [];
    /** 布局方式：流式布局、绝对定位、固定定位 */
    private mode: Mode = Mode.ABSOLUTE;
    private designWidth: number;

    constructor(config: IDragResizeHelperConfig) {
        this.designWidth = config.designWidth;
        this.moveableHelper = MoveableHelper.create({
            useBeforeRender: true,
            useRender: false,
            createAuto: true,
        });

        this.targetShadow = new TargetShadow({
            container: config.container,
            updateDragEl: config.updateDragEl,
            zIndex: ZIndex.DRAG_EL,
            idPrefix: DRAG_EL_ID_PREFIX,
        });
    }

    public destroy(): void {
        this.targetShadow.destroy();
        this.destroyGhostEl();
        this.moveableHelper.clear();
    }

    public destroyShadowEl(): void {
        this.targetShadow.destroyEl();
    }

    public getShadowEl(): ITargetElement | undefined {
        return this.targetShadow.el;
    }

    public updateShadowEl(el: HTMLElement): void {
        this.destroyGhostEl();
        this.target = el;
        this.targetShadow.update(el);
    }

    public setMode(mode: Mode): void {
        this.mode = mode;
    }

    /**
	 * 改变大小事件开始
	 * @param e 包含了拖拽节点的dom，moveableHelper会直接修改拖拽节点
	 */
    public onResizeStart(e: OnResizeStart): void {
        this.moveableHelper.onResizeStart(e);

        this.frameSnapShot.top = this.target.offsetTop;
        this.frameSnapShot.left = this.target.offsetLeft;
    }

    public onResize(e: OnResize): void {
        const { width, height, drag, } = e;
        const { beforeTranslate, } = drag;
        // 流式布局
        if (this.mode === Mode.SORTABLE) {
            this.target.style.top = '0px';
            if (this.targetShadow.el) {
                this.targetShadow.el.style.width = `${width}px`;
                this.targetShadow.el.style.height = `${height}px`;
            }
        } else {
            this.moveableHelper.onResize(e);
            const { marginLeft, marginTop, } = getMarginValue(this.target);
            this.target.style.left = `${
                this.frameSnapShot.left + beforeTranslate[0] - marginLeft
            }px`;
            this.target.style.top = `${
                this.frameSnapShot.top + beforeTranslate[1] - marginTop
            }px`;
        }

        const {
            borderLeftWidth,
            borderRightWidth,
            borderTopWidth,
            borderBottomWidth,
        } = getBorderWidth(this.target);

        this.target.style.width = `${
            width + borderLeftWidth + borderRightWidth
        }px`;
        this.target.style.height = `${
            height + borderTopWidth + borderBottomWidth
        }px`;
    }

    public onDragStart(e: OnDragStart): void {
        this.moveableHelper.onDragStart(e);

        if (this.mode === Mode.SORTABLE) {
            this.ghostEl = this.generateGhostEl(this.target);
        }

        this.frameSnapShot.top = this.target.offsetTop;
        this.frameSnapShot.left = this.target.offsetLeft;
    }

    public onDrag(e: OnDrag): void {
        // 流式布局
        if (this.ghostEl) {
            this.ghostEl.style.top = `${
                this.frameSnapShot.top + e.beforeTranslate[1]
            }px`;
            return;
        }

        this.moveableHelper.onDrag(e);

        const { marginLeft, marginTop, } = getMarginValue(this.target);

        this.target.style.left = `${
            this.frameSnapShot.left + e.beforeTranslate[0] - marginLeft
        }px`;
        this.target.style.top = `${
            this.frameSnapShot.top + e.beforeTranslate[1] - marginTop
        }px`;
    }

    public onRotateStart(e: OnRotateStart): void {
        this.moveableHelper.onRotateStart(e);
    }

    public onRotate(e: OnRotate): void {
        this.moveableHelper.onRotate(e);
        const frame = this.moveableHelper.getFrame(e.target);
        this.target.style.transform = frame?.toCSSObject().transform || '';
    }

    public onScaleStart(e: OnScaleStart): void {
        this.moveableHelper.onScaleStart(e);
    }

    public onScale(e: OnScale): void {
        this.moveableHelper.onScale(e);
        const frame = this.moveableHelper.getFrame(e.target);
        this.target.style.transform = frame?.toCSSObject().transform || '';
    }

    public getGhostEl(): HTMLElement | undefined {
        return this.ghostEl;
    }

    public destroyGhostEl(): void {
        this.ghostEl?.remove();
        this.ghostEl = undefined;
    }

    public clear(): void {
        this.moveableHelper.clear();
    }

    public getFrame(
        el: HTMLElement | SVGElement
    ): ReturnType<MoveableHelper['getFrame']> {
        return this.moveableHelper.getFrame(el);
    }

    public getShadowEls(): ITargetElement[] {
        return this.targetShadow.els;
    }

    public updateGroup(els: HTMLElement[]): void {
        this.targetList = els;
        this.framesSnapShot = [];
        this.targetShadow.updateGroup(els);
    }

    public setTargetList(targetList: HTMLElement[]): void {
        this.targetList = targetList;
    }

    public clearMultiSelectStatus(): void {
        this.targetList = [];
        this.targetShadow.destroyEls();
    }

    public onResizeGroupStart(e: OnResizeGroupStart): void {
        const { events, } = e;
        this.moveableHelper.onResizeGroupStart(e);
        this.setFramesSnapShot(events);
    }

    /**
	 * 多选状态下通过拖拽边框改变大小，所有选中组件会一起改变大小
	 */
    public onResizeGroup(e: OnResizeGroup): void {
        const { events, } = e;
        // 拖动过程更新
        events.forEach((ev) => {
            const { width, height, beforeTranslate, } = ev.drag;
            const frameSnapShot = this.framesSnapShot.find(
                (frameItem) =>
                    frameItem.id === ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!frameSnapShot) return;
            const targeEl = this.targetList.find(
                (targetItem) =>
                    targetItem.id ===
					ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!targeEl) return;
            // 元素与其所属组同时加入多选列表时，只更新父元素
            const isParentIncluded = this.targetList.find(
                (targetItem) => targetItem.id === targeEl.parentElement?.id
            );

            if (!isParentIncluded) {
                // 更新页面元素位置
                const { marginLeft, marginTop, } = getMarginValue(targeEl);
                targeEl.style.left = `${
                    frameSnapShot.left + beforeTranslate[0] - marginLeft
                }px`;
                targeEl.style.top = `${
                    frameSnapShot.top + beforeTranslate[1] - marginTop
                }px`;
            }

            // 更新页面元素大小
            targeEl.style.width = `${width}px`;
            targeEl.style.height = `${height}px`;
        });
        this.moveableHelper.onResizeGroup(e);
    }

    public onDragGroupStart(e: OnDragGroupStart): void {
        const { events, } = e;
        this.moveableHelper.onDragGroupStart(e);
        // 记录拖动前快照
        this.setFramesSnapShot(events);
    }

    public onDragGroup(e: OnDragGroup): void {
        const { events, } = e;
        // 拖动过程更新
        events.forEach((ev) => {
            const frameSnapShot = this.framesSnapShot.find(
                (frameItem) =>
                    frameItem.id === ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!frameSnapShot) return;
            const targeEl = this.targetList.find(
                (targetItem) =>
                    targetItem.id ===
					ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!targeEl) return;
            // 元素与其所属组同时加入多选列表时，只更新父元素
            const isParentIncluded = this.targetList.find(
                (targetItem) => targetItem.id === targeEl.parentElement?.id
            );
            if (!isParentIncluded) {
                // 更新页面元素位置
                const { marginLeft, marginTop, } = getMarginValue(targeEl);
                targeEl.style.left = `${
                    frameSnapShot.left + ev.beforeTranslate[0] - marginLeft
                }px`;
                targeEl.style.top = `${
                    frameSnapShot.top + ev.beforeTranslate[1] - marginTop
                }px`;
            }
        });
        this.moveableHelper.onDragGroup(e);
    }

    public getUpdatedElRect(
        el: HTMLElement,
        parentEl: HTMLElement | null,
        doc: Document
    ): IRect {
        const offset = this.mode === Mode.SORTABLE ? { left: 0, top: 0, } : { left: el.offsetLeft, top: el.offsetTop, };

        const { marginLeft, marginTop, } = getMarginValue(el);

        let left = calcValueByDesignWidth(doc, offset.left, this.designWidth) - marginLeft;
        let top = calcValueByDesignWidth(doc, offset.top, this.designWidth) - marginTop;

        const {
            borderLeftWidth,
            borderRightWidth,
            borderTopWidth,
            borderBottomWidth,
        } = getBorderWidth(el);

        const width = calcValueByDesignWidth(
            doc,
            el.clientWidth + borderLeftWidth + borderRightWidth,
            this.designWidth
        );
        const height = calcValueByDesignWidth(
            doc,
            el.clientHeight + borderTopWidth + borderBottomWidth,
            this.designWidth
        );

        let shadowEl = this.getShadowEl();
        const shadowEls = this.getShadowEls();

        if (shadowEls.length) {
            shadowEl = shadowEls.find((item) => item.id.endsWith(el.id));
        }

        if (parentEl && this.mode === Mode.ABSOLUTE && shadowEl) {
            const targetShadowHtmlEl = shadowEl as HTMLElement;
            const targetShadowElOffsetLeft = targetShadowHtmlEl.offsetLeft || 0;
            const targetShadowElOffsetTop = targetShadowHtmlEl.offsetTop || 0;

            const frame = this.getFrame(shadowEl);

            const [translateX, translateY] =
				frame?.properties.transform.translate.value;
            const { left: parentLeft, top: parentTop, } =
				js_utils_dom_offset(parentEl);

            // 原来的位置 + translate 的位置 - 新父节点的offset
            left =
                calcValueByDesignWidth(doc, targetShadowElOffsetLeft + parseFloat(translateX) - parentLeft, this.designWidth);
            top =
                calcValueByDesignWidth(doc, targetShadowElOffsetTop + parseFloat(translateY) - parentTop, this.designWidth);
        }

        return { width, height, left, top, };
    }

    /**
	 * 多选状态设置多个节点的快照
	 */
    private setFramesSnapShot(events: OnDragStart[] | OnResizeStart[]): void {
        // 同一组被选中的目标元素多次拖拽和改变大小会触发多次setFramesSnapShot，只有第一次可以设置成功
        if (this.framesSnapShot.length > 0) return;
        // 记录拖动前快照
        events.forEach((ev) => {
            // 实际目标元素
            const matchEventTarget = this.targetList.find(
                (targetItem) =>
                    targetItem.id ===
					ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!matchEventTarget) return;
            this.framesSnapShot.push({
                left: matchEventTarget.offsetLeft,
                top: matchEventTarget.offsetTop,
                id: matchEventTarget.id,
            });
        });
    }

    /**
	 * 流式布局把目标节点复制一份进行拖拽，在拖拽结束前不影响页面原布局样式
	 */
    private generateGhostEl(el: HTMLElement): HTMLElement {
        if (this.ghostEl) {
            this.destroyGhostEl();
        }

        const ghostEl = el.cloneNode(true) as HTMLElement;
        this.setGhostElChildrenId(ghostEl);
        const { top, left, } = getAbsolutePosition(el, js_utils_dom_offset(el));
        ghostEl.id = `${GHOST_EL_ID_PREFIX}${el.id}`;
        ghostEl.style.zIndex = ZIndex.GHOST_EL;
        ghostEl.style.opacity = '.5';
        ghostEl.style.position = 'absolute';
        ghostEl.style.left = `${left}px`;
        ghostEl.style.top = `${top}px`;
        ghostEl.style.marginLeft = '0';
        ghostEl.style.marginTop = '0';
        el.after(ghostEl);
        return ghostEl;
    }

    private setGhostElChildrenId(el: Element): void {
        for (const child of Array.from(el.children)) {
            if (child.id) {
                child.id = `${GHOST_EL_ID_PREFIX}${child.id}`;
            }

            if (child.children.length) {
                this.setGhostElChildrenId(child);
            }
        }
    }
}
