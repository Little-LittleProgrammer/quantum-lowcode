import { createElement, isFixedParent, js_utils_get_uuid } from '@quantum-lowcode/utils';
import { Mode, ZIndex } from './const';
import type { ITargetElement, ITargetShadowConfig, IUpdateDragEl } from './types';
import { getTargetElStyle } from './utils';

/**
 * 目标阴影管理器
 * 将选中的节点修正定位后，添加一个操作节点到蒙层上
 * 统一管理拖拽框和高亮框，包括创建、更新、销毁。
 */
export class TargetShadow {
    /** 当前单个目标元素 */
    public el?: ITargetElement;
    /** 多个目标元素数组 */
    public els: ITargetElement[] = [];

    /** 唯一标识前缀，用于生成DOM元素ID */
    private idPrefix = `target_calibrate_${js_utils_get_uuid(4)}`;
    /** 容器元素，用于承载所有的目标阴影元素 */
    private container: HTMLElement;
    /** 容器水平滚动距离 */
    private scrollLeft = 0;
    /** 容器垂直滚动距离 */
    private scrollTop = 0;
    /** 阴影元素的层级索引 */
    private zIndex?: ZIndex;

    /** 更新拖拽元素的回调函数 */
    private updateDragEl?: IUpdateDragEl;

    /**
     * 构造函数
     * @param config 目标阴影配置参数
     */
    constructor(config: ITargetShadowConfig) {
        this.container = config.container;

        // 如果提供了更新拖拽元素的回调函数，则保存它
        if (config.updateDragEl) {
            this.updateDragEl = config.updateDragEl;
        }

        // 如果指定了层级索引，则设置它
        if (typeof config.zIndex !== 'undefined') {
            this.zIndex = config.zIndex;
        }

        // 如果提供了自定义ID前缀，则使用它
        if (config.idPrefix) {
            this.idPrefix = `${config.idPrefix}_${js_utils_get_uuid(4)}`;
        }

        // 监听容器的自定义滚动事件
        this.container.addEventListener('customScroll', this.scrollHandler);
    }

    /**
     * 更新单个目标元素
     * @param target 目标元素
     * @returns 更新后的目标元素
     */
    public update(target: ITargetElement): ITargetElement {
        this.el = this.updateEl(target, this.el);
        return this.el;
    }

    /**
     * 更新多个目标元素
     * @param targets 目标元素数组
     * @returns 更新后的目标元素数组
     */
    public updateGroup(targets: ITargetElement[]): ITargetElement[] {
        // 如果现有元素数量大于新的目标数量，则移除多余的元素
        if (this.els.length > targets.length) {
            this.els.slice(targets.length - 1).forEach((el) => {
                el.remove();
            });
        }
        // 逐个更新目标元素
        this.els = targets.map((target, index) => this.updateEl(target, this.els[index]));
        return this.els;
    }

    /**
     * 销毁单个目标元素
     */
    public destroyEl(): void {
        this.el?.remove();
        this.el = undefined;
    }

    /**
     * 销毁所有目标元素
     */
    public destroyEls(): void {
        this.els.forEach((el) => {
            el.remove();
        });
        this.els = [];
    }

    /**
     * 销毁整个目标阴影管理器
     * 清理事件监听器和所有元素
     */
    public destroy(): void {
        this.container.removeEventListener('customScroll', this.scrollHandler);
        this.destroyEl();
    }

    /**
     * 更新目标元素的内部实现
     * @param target 目标元素
     * @param src 可选的源元素，如果提供则复用，否则创建新元素
     * @returns 更新后的目标元素
     */
    private updateEl(
        target: ITargetElement,
        src?: ITargetElement
    ): ITargetElement {
        // 如果没有提供源元素，则创建新的div元素
        const el = src || createElement({
            tag: 'div'
        });

        // 设置元素ID，使用前缀和目标ID组合
        el.id = `${this.idPrefix}${target.id}`;

        // 设置元素样式，包括位置、尺寸、层级等
        el.style.cssText = getTargetElStyle(target, this.zIndex, Number.parseFloat(this.container.style.left));

        // 如果提供了更新拖拽元素的回调函数，则执行它
        if (typeof this.updateDragEl === 'function') {
            this.updateDragEl(el, target, this.container);
        }

        // 检查目标元素是否为固定定位的父元素
        const isFixed = isFixedParent(target);
        // 获取容器的定位模式
        const mode = this.container.dataset.mode || Mode.ABSOLUTE;

        // 根据定位模式和是否固定定位来调整元素的transform属性
        if (isFixed && mode !== Mode.FIXED) {
            // 如果目标是固定定位但容器不是固定模式，需要加上滚动偏移
            el.style.transform = `translate3d(${this.scrollLeft}px, ${this.scrollTop}px, 0)`;
        } else if (!isFixed && mode === Mode.FIXED) {
            // 如果目标不是固定定位但容器是固定模式，需要减去滚动偏移
            el.style.transform = `translate3d(${-this.scrollLeft}px, ${-this.scrollTop}px, 0)`;
        }

        // 如果元素还没有添加到DOM中，则将其添加到容器中
        if (!globalThis.document.getElementById(el.id)) {
            this.container.append(el);
        }
        return el;
    }

    /**
     * 滚动事件处理器
     * 用于更新滚动位置，以便正确处理固定定位元素的偏移
     * @param e 滚动事件对象
     */
    private scrollHandler = (e: any) => {
        this.scrollLeft = e.detail.scrollLeft;
        this.scrollTop = e.detail.scrollTop;
    };
}
