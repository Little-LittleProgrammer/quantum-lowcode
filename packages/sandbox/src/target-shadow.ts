import { isFixedParent, js_utils_get_uuid } from '@quantum-lowcode/utils';
import { Mode, ZIndex } from './const';
import { ITargetElement, ITargetShadowConfig, IUpdateDragEl } from './types';
import { getTargetElStyle } from './utils';

/**
 * 将选中的节点修正定位后，添加一个操作节点到蒙层上
 * 统一管理拖拽框和高亮框，包括创建、更新、销毁。
 */
export class TargetShadow {
    public el?: ITargetElement;
    public els: ITargetElement[] = [];

    private idPrefix = `target_calibrate_${js_utils_get_uuid(4)}`;
    private container: HTMLElement;
    private scrollLeft = 0;
    private scrollTop = 0;
    private zIndex?: ZIndex;

    private updateDragEl?: IUpdateDragEl;

    constructor(config: ITargetShadowConfig) {
        this.container = config.container;

        if (config.updateDragEl) {
            this.updateDragEl = config.updateDragEl;
        }

        if (typeof config.zIndex !== 'undefined') {
            this.zIndex = config.zIndex;
        }

        if (config.idPrefix) {
            this.idPrefix = `${config.idPrefix}_${js_utils_get_uuid(4)}`;
        }

        this.container.addEventListener('customScroll', this.scrollHandler);
    }

    public update(target: ITargetElement): ITargetElement {
        this.el = this.updateEl(target, this.el);
        return this.el;
    }

    public updateGroup(targets: ITargetElement[]): ITargetElement[] {
        if (this.els.length > targets.length) {
            this.els.slice(targets.length - 1).forEach((el) => {
                el.remove();
            });
        }
        this.els = targets.map((target, index) => this.updateEl(target, this.els[index]));
        return this.els;
    }

    public destroyEl(): void {
        this.el?.remove();
        this.el = undefined;
    }

    public destroyEls(): void {
        this.els.forEach((el) => {
            el.remove();
        });
        this.els = [];
    }

    public destroy(): void {
        this.container.removeEventListener('customScroll', this.scrollHandler);
        this.destroyEl();
    }

    private updateEl(
        target: ITargetElement,
        src?: ITargetElement
    ): ITargetElement {
        const el = src || globalThis.document.createElement('div');

        el.id = `${this.idPrefix}${target.id}`;

        el.style.cssText = getTargetElStyle(target, this.zIndex, Number.parseFloat(this.container.style.left));

        if (typeof this.updateDragEl === 'function') {
            this.updateDragEl(el, target, this.container);
        }
        const isFixed = isFixedParent(target);
        const mode = this.container.dataset.mode || Mode.ABSOLUTE;
        if (isFixed && mode !== Mode.FIXED) {
            el.style.transform = `translate3d(${this.scrollLeft}px, ${this.scrollTop}px, 0)`;
        } else if (!isFixed && mode === Mode.FIXED) {
            el.style.transform = `translate3d(${-this.scrollLeft}px, ${-this.scrollTop}px, 0)`;
        }

        if (!globalThis.document.getElementById(el.id)) {
            this.container.append(el);
        }
        return el;
    }

    private scrollHandler = (e: any) => {
        this.scrollLeft = e.detail.scrollLeft;
        this.scrollTop = e.detail.scrollTop;
    };
}
