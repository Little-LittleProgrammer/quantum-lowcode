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
import { calcValueByDesignWidth, js_utils_dom_offset, getAbsolutePosition } from '@quantum-lowcode/utils';

/**
 * 拖拽/改变大小等操作助手类
 *
 * 主要功能：
 * 1. 响应 moveable 库抛出的各种状态事件（拖拽、缩放、旋转等）
 * 2. 对目标节点 target 和拖拽节点 targetShadow 进行修改
 * 3. 支持单个元素和多个元素的拖拽缩放操作
 * 4. 支持不同布局模式（绝对定位、流式布局、固定定位）
 *
 * 工作原理：
 * - 目标节点由 DragResizeHelper 直接修改
 * - targetShadow 作为直接被操作的拖拽框，通过 moveableHelper 修改
 * - 特殊情况：流式布局下 moveableHelper 不支持，targetShadow 也由 DragResizeHelper 直接修改
 */
export default class DragResizeHelper {
    /** 目标节点在蒙层上的占位节点，用于跟鼠标交互，避免鼠标事件直接作用到目标节点 */
    private targetShadow: TargetShadow;
    /** 要操作的原始目标节点 */
    private target!: HTMLElement;
    /** 多选模式下的目标节点组 */
    private targetList: HTMLElement[] = [];
    /**
     * 响应拖拽的状态事件，修改绝对定位布局下 targetShadow 的 DOM
     * 注意：MoveableHelper 里面的方法是成员属性，如果 DragResizeHelper 用继承的方式将无法通过 super 去调这些方法
     */
    private moveableHelper: MoveableHelper;
    /** 流式布局下，目标节点的镜像节点，用于在拖拽时显示预览效果 */
    private ghostEl: HTMLElement | undefined;
    /** 用于记录单个节点被改变前的位置快照 */
    private frameSnapShot = {
        left: 0,
        top: 0
    };
    /** 多选模式下记录多个节点被改变前的位置快照 */
    private framesSnapShot: { left: number; top: number; id: string }[] = [];
    /** 当前布局方式：流式布局(SORTABLE)、绝对定位(ABSOLUTE)、固定定位(FIXED) */
    private mode: Mode = Mode.ABSOLUTE;
    /** 设计稿宽度，用于响应式计算 */
    private designWidth: number;

    /**
     * 构造函数
     * @param config 配置对象
     * @param config.designWidth 设计稿宽度
     * @param config.container 容器元素
     * @param config.updateDragEl 更新拖拽元素的回调函数
     */
    constructor(config: IDragResizeHelperConfig) {
        this.designWidth = config.designWidth;

        // 初始化 moveable 助手，用于处理绝对定位模式下的拖拽和缩放
        this.moveableHelper = MoveableHelper.create({
            useBeforeRender: true,
            useRender: false,
            createAuto: true
        });

        // 初始化目标阴影节点，用于在蒙层上显示拖拽框
        this.targetShadow = new TargetShadow({
            container: config.container,
            updateDragEl: config.updateDragEl,
            zIndex: ZIndex.DRAG_EL,
            idPrefix: DRAG_EL_ID_PREFIX
        });
    }

    /**
     * 销毁实例，清理所有资源
     */
    public destroy(): void {
        this.targetShadow.destroy();
        this.destroyGhostEl();
        this.moveableHelper.clear();
    }

    /**
     * 销毁阴影元素
     */
    public destroyShadowEl(): void {
        this.targetShadow.destroyEl();
    }

    /**
     * 获取阴影元素
     * @returns 阴影元素或 undefined
     */
    public getShadowEl(): ITargetElement | undefined {
        return this.targetShadow.el;
    }

    /**
     * 更新阴影元素，绑定到新的目标元素
     * @param el 新的目标元素
     */
    public updateShadowEl(el: HTMLElement): void {
        this.destroyGhostEl();
        this.target = el;
        this.targetShadow.update(el);
    }

    /**
     * 设置布局模式
     * @param mode 布局模式（绝对定位、流式布局、固定定位）
     */
    public setMode(mode: Mode): void {
        this.mode = mode;
    }

    /**
     * 缩放操作开始时的处理
     * @param e moveable 的缩放开始事件对象
     */
    public onResizeStart(e: OnResizeStart): void {
        // 委托给 moveableHelper 处理
        this.moveableHelper.onResizeStart(e);

        // 记录目标元素的初始位置，用于计算相对偏移
        this.frameSnapShot.top = this.target.offsetTop;
        this.frameSnapShot.left = this.target.offsetLeft;
    }

    /**
     * 缩放操作过程中的处理
     * @param e moveable 的缩放事件对象
     */
    public onResize(e: OnResize): void {
        const { width, height, drag } = e;
        const { beforeTranslate } = drag;

        // 流式布局的特殊处理
        if (this.mode === Mode.SORTABLE) {
            // 流式布局下保持顶部对齐
            this.target.style.top = '0px';
            if (this.targetShadow.el) {
                this.targetShadow.el.style.width = `${width}px`;
                this.targetShadow.el.style.height = `${height}px`;
            }
        } else {
            // 绝对定位模式委托给 moveableHelper
            this.moveableHelper.onResize(e);

            // 计算并设置目标元素的新位置，考虑 margin 值
            const { marginLeft, marginTop } = getMarginValue(this.target);
            this.target.style.left = `${
                this.frameSnapShot.left + beforeTranslate[0] - (marginLeft || 0)
            }px`;
            this.target.style.top = `${
                this.frameSnapShot.top + beforeTranslate[1] - (marginTop || 0)
            }px`;
        }

        // 获取边框宽度，用于精确计算元素尺寸
        const {
            borderLeftWidth,
            borderRightWidth,
            borderTopWidth,
            borderBottomWidth
        } = getBorderWidth(this.target);

        // 设置目标元素的新尺寸，包含边框
        this.target.style.width = `${
            width + borderLeftWidth + borderRightWidth
        }px`;
        this.target.style.height = `${
            height + borderTopWidth + borderBottomWidth
        }px`;
    }

    /**
     * 拖拽操作开始时的处理
     * @param e moveable 的拖拽开始事件对象
     */
    public onDragStart(e: OnDragStart): void {
        // 委托给 moveableHelper 处理
        this.moveableHelper.onDragStart(e);

        // 流式布局下创建镜像元素用于拖拽预览
        if (this.mode === Mode.SORTABLE) {
            this.ghostEl = this.generateGhostEl(this.target);
        }

        // 记录拖拽开始时的位置快照
        this.frameSnapShot.top = this.target.offsetTop;
        this.frameSnapShot.left = this.target.offsetLeft;
    }

    /**
     * 拖拽操作过程中的处理
     * @param e moveable 的拖拽事件对象
     */
    public onDrag(e: OnDrag): void {
        // 流式布局下操作镜像元素
        if (this.ghostEl) {
            this.ghostEl.style.top = `${
                this.frameSnapShot.top + e.beforeTranslate[1]
            }px`;
            return;
        }

        // 绝对定位模式委托给 moveableHelper
        this.moveableHelper.onDrag(e);

        // 计算并设置目标元素的新位置
        const { marginLeft, marginTop } = getMarginValue(this.target);

        this.target.style.left = `${
            this.frameSnapShot.left + e.beforeTranslate[0] - (marginLeft || 0)
        }px`;
        this.target.style.top = `${
            this.frameSnapShot.top + e.beforeTranslate[1] - (marginTop || 0)
        }px`;
    }

    /**
     * 旋转操作开始时的处理
     * @param e moveable 的旋转开始事件对象
     */
    public onRotateStart(e: OnRotateStart): void {
        this.moveableHelper.onRotateStart(e);
    }

    /**
     * 旋转操作过程中的处理
     * @param e moveable 的旋转事件对象
     */
    public onRotate(e: OnRotate): void {
        this.moveableHelper.onRotate(e);
        // 获取旋转后的变换矩阵并应用到目标元素
        const frame = this.moveableHelper.getFrame(e.target);
        this.target.style.transform = frame?.toCSSObject().transform || '';
    }

    /**
     * 缩放操作开始时的处理
     * @param e moveable 的缩放开始事件对象
     */
    public onScaleStart(e: OnScaleStart): void {
        this.moveableHelper.onScaleStart(e);
    }

    /**
     * 缩放操作过程中的处理
     * @param e moveable 的缩放事件对象
     */
    public onScale(e: OnScale): void {
        this.moveableHelper.onScale(e);
        // 获取缩放后的变换矩阵并应用到目标元素
        const frame = this.moveableHelper.getFrame(e.target);
        this.target.style.transform = frame?.toCSSObject().transform || '';
    }

    /**
     * 获取镜像元素（流式布局下使用）
     * @returns 镜像元素或 undefined
     */
    public getGhostEl(): HTMLElement | undefined {
        return this.ghostEl;
    }

    /**
     * 销毁镜像元素
     */
    public destroyGhostEl(): void {
        this.ghostEl?.remove();
        this.ghostEl = undefined;
    }

    /**
     * 清理 moveableHelper 的状态
     */
    public clear(): void {
        this.moveableHelper.clear();
    }

    /**
     * 获取元素的 frame 对象，包含变换信息
     * @param el 目标元素
     * @returns frame 对象
     */
    public getFrame(
        el: HTMLElement | SVGElement
    ): ReturnType<MoveableHelper['getFrame']> {
        return this.moveableHelper.getFrame(el);
    }

    /**
     * 获取所有阴影元素（多选模式下使用）
     * @returns 阴影元素数组
     */
    public getShadowEls(): ITargetElement[] {
        return this.targetShadow.els;
    }

    /**
     * 更新多选组，设置多个目标元素
     * @param els 目标元素数组
     */
    public updateGroup(els: HTMLElement[]): void {
        this.targetList = els;
        this.framesSnapShot = [];
        this.targetShadow.updateGroup(els);
    }

    /**
     * 设置目标元素列表（多选模式）
     * @param targetList 目标元素数组
     */
    public setTargetList(targetList: HTMLElement[]): void {
        this.targetList = targetList;
    }

    /**
     * 清除多选状态
     */
    public clearMultiSelectStatus(): void {
        this.targetList = [];
        this.targetShadow.destroyEls();
    }

    /**
     * 多选模式下缩放操作开始时的处理
     * @param e moveable 的多选缩放开始事件对象
     */
    public onResizeGroupStart(e: OnResizeGroupStart): void {
        const { events } = e;
        this.moveableHelper.onResizeGroupStart(e);
        // 记录所有选中元素的位置快照
        this.setFramesSnapShot(events);
    }

    /**
     * 多选状态下通过拖拽边框改变大小，所有选中组件会一起改变大小
     * @param e moveable 的多选缩放事件对象
     */
    public onResizeGroup(e: OnResizeGroup): void {
        const { events } = e;

        // 遍历所有被选中的元素，同时进行缩放操作
        events.forEach((ev) => {
            const { width, height, beforeTranslate } = ev.drag;

            // 查找对应的位置快照
            const frameSnapShot = this.framesSnapShot.find(
                (frameItem) =>
                    frameItem.id === ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!frameSnapShot) return;

            // 查找对应的目标元素
            const targeEl = this.targetList.find(
                (targetItem) =>
                    targetItem.id ===
					ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!targeEl) return;

            // 检查是否有父元素也在选中列表中，避免重复更新
            const isParentIncluded = this.targetList.find(
                (targetItem) => targetItem.id === targeEl.parentElement?.id
            );

            if (!isParentIncluded) {
                // 更新页面元素位置，考虑 margin 值
                const { marginLeft, marginTop } = getMarginValue(targeEl);
                targeEl.style.left = `${
                    frameSnapShot.left + beforeTranslate[0] - (marginLeft || 0)
                }px`;
                targeEl.style.top = `${
                    frameSnapShot.top + beforeTranslate[1] - (marginTop || 0)
                }px`;
            }

            // 更新页面元素大小
            targeEl.style.width = `${width}px`;
            targeEl.style.height = `${height}px`;
        });

        // 委托给 moveableHelper 处理阴影元素
        this.moveableHelper.onResizeGroup(e);
    }

    /**
     * 多选模式下拖拽操作开始时的处理
     * @param e moveable 的多选拖拽开始事件对象
     */
    public onDragGroupStart(e: OnDragGroupStart): void {
        const { events } = e;
        this.moveableHelper.onDragGroupStart(e);
        // 记录拖动前的位置快照
        this.setFramesSnapShot(events);
    }

    /**
     * 多选模式下拖拽操作过程中的处理
     * @param e moveable 的多选拖拽事件对象
     */
    public onDragGroup(e: OnDragGroup): void {
        const { events } = e;

        // 遍历所有被选中的元素，同时进行拖拽操作
        events.forEach((ev) => {
            // 查找对应的位置快照
            const frameSnapShot = this.framesSnapShot.find(
                (frameItem) =>
                    frameItem.id === ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!frameSnapShot) return;

            // 查找对应的目标元素
            const targeEl = this.targetList.find(
                (targetItem) =>
                    targetItem.id ===
					ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!targeEl) return;

            // 检查是否有父元素也在选中列表中，避免重复更新
            const isParentIncluded = this.targetList.find(
                (targetItem) => targetItem.id === targeEl.parentElement?.id
            );

            if (!isParentIncluded) {
                // 更新页面元素位置，考虑 margin 值
                const { marginLeft, marginTop } = getMarginValue(targeEl);
                targeEl.style.left = `${
                    frameSnapShot.left + ev.beforeTranslate[0] - (marginLeft || 0)
                }px`;
                targeEl.style.top = `${
                    frameSnapShot.top + ev.beforeTranslate[1] - (marginTop || 0)
                }px`;
            }
        });

        // 委托给 moveableHelper 处理阴影元素
        this.moveableHelper.onDragGroup(e);
    }

    /**
     * 获取更新后的元素位置和尺寸信息
     * @param el 目标元素
     * @param parentEl 父元素
     * @param doc 文档对象
     * @returns 包含位置和尺寸信息的对象
     */
    public getUpdatedElRect(
        el: HTMLElement,
        parentEl: HTMLElement | null,
        doc: Document
    ): IRect {
        // 根据布局模式获取不同的偏移量
        const offset = this.mode === Mode.SORTABLE ? { left: 0, top: 0 } : { left: el.offsetLeft, top: el.offsetTop };

        const { marginLeft, marginTop } = getMarginValue(el);

        // 根据设计稿宽度计算响应式位置
        let left = calcValueByDesignWidth(doc, offset.left, this.designWidth) - (marginLeft || 0);
        let top = calcValueByDesignWidth(doc, offset.top, this.designWidth) - (marginTop || 0);

        // 获取边框宽度用于精确计算尺寸
        const {
            borderLeftWidth,
            borderRightWidth,
            borderTopWidth,
            borderBottomWidth
        } = getBorderWidth(el);

        // 根据设计稿宽度计算响应式尺寸
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

        // 获取阴影元素用于精确计算位置
        let shadowEl = this.getShadowEl();
        const shadowEls = this.getShadowEls();

        // 多选模式下找到对应的阴影元素
        if (shadowEls.length) {
            shadowEl = shadowEls.find((item) => item.id.endsWith(el.id));
        }

        // 绝对定位模式下需要考虑变换和父元素位置
        if (parentEl && this.mode === Mode.ABSOLUTE && shadowEl) {
            const targetShadowHtmlEl = shadowEl as HTMLElement;
            const targetShadowElOffsetLeft = targetShadowHtmlEl.offsetLeft || 0;
            const targetShadowElOffsetTop = targetShadowHtmlEl.offsetTop || 0;

            // 获取变换信息
            const frame = this.getFrame(shadowEl);

            // 安全地获取变换值，避免 undefined 错误
            const translateValues = frame?.properties?.transform?.translate?.value;
            const [translateX, translateY] = translateValues || ['0', '0'];

            // 获取父元素位置
            const { left: parentLeft, top: parentTop } = js_utils_dom_offset(parentEl);

            // 计算相对于父元素的位置：原来的位置 + translate 的位置 - 新父节点的 offset
            left = calcValueByDesignWidth(
                doc,
                targetShadowElOffsetLeft + parseFloat(translateX as string) - parentLeft,
                this.designWidth
            );
            top = calcValueByDesignWidth(
                doc,
                targetShadowElOffsetTop + parseFloat(translateY as string) - parentTop,
                this.designWidth
            );
        }

        return { width, height, left, top };
    }

    /**
     * 多选状态下设置多个节点的位置快照
     * @param events 拖拽或缩放开始事件数组
     */
    private setFramesSnapShot(events: OnDragStart[] | OnResizeStart[]): void {
        // 同一组被选中的目标元素多次拖拽和改变大小会触发多次 setFramesSnapShot
        // 只有第一次可以设置成功，避免重复设置
        if (this.framesSnapShot.length > 0) return;

        // 记录每个选中元素拖动前的位置快照
        events.forEach((ev) => {
            // 通过 ID 查找对应的实际目标元素
            const matchEventTarget = this.targetList.find(
                (targetItem) =>
                    targetItem.id === ev.target.id.replace(DRAG_EL_ID_PREFIX, '')
            );
            if (!matchEventTarget) return;

            // 保存位置快照
            this.framesSnapShot.push({
                left: matchEventTarget.offsetLeft,
                top: matchEventTarget.offsetTop,
                id: matchEventTarget.id
            });
        });
    }

    /**
     * 流式布局下创建目标节点的镜像元素进行拖拽
     * 在拖拽结束前不影响页面原布局样式
     * @param el 要创建镜像的目标元素
     * @returns 创建的镜像元素
     */
    private generateGhostEl(el: HTMLElement): HTMLElement {
        // 如果已有镜像元素，先销毁
        if (this.ghostEl) {
            this.destroyGhostEl();
        }

        // 克隆目标元素
        const ghostEl = el.cloneNode(true) as HTMLElement;

        // 递归设置子元素 ID，避免 ID 冲突
        this.setGhostElChildrenId(ghostEl);

        // 获取元素的绝对位置
        const { top, left } = getAbsolutePosition(el, js_utils_dom_offset(el));

        // 设置镜像元素的样式和位置
        ghostEl.id = `${GHOST_EL_ID_PREFIX}${el.id}`;
        ghostEl.style.zIndex = ZIndex.GHOST_EL;
        ghostEl.style.opacity = '.5'; // 半透明效果
        ghostEl.style.position = 'absolute';
        ghostEl.style.left = `${left}px`;
        ghostEl.style.top = `${top}px`;
        ghostEl.style.marginLeft = '0'; // 清除原有 margin
        ghostEl.style.marginTop = '0';

        // 插入到原元素后面
        el.after(ghostEl);
        return ghostEl;
    }

    /**
     * 递归设置镜像元素及其子元素的 ID，避免与原元素 ID 冲突
     * @param el 要设置 ID 的元素
     */
    private setGhostElChildrenId(el: Element): void {
        for (const child of Array.from(el.children)) {
            if (child.id) {
                child.id = `${GHOST_EL_ID_PREFIX}${child.id}`;
            }

            // 递归处理子元素
            if (child.children.length) {
                this.setGhostElChildrenId(child);
            }
        }
    }
}
