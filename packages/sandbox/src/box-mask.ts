import { Mode, ZIndex } from './const';
import { Rule } from './rule';
import {
    createElement,
    isFixedParent,
    getScrollParent
} from '@qimao/quantum-utils';
import { IRuleOptions } from './types';

const wrapperClassName = 'editor-mask-wrapper';
function createWrapper(): HTMLDivElement {
    const el = createElement({
        className: wrapperClassName,
        cssText: `
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          z-index: ${ZIndex.MASK};
        `,
    }) as HTMLDivElement;

    return el;
}

function createConent(): HTMLDivElement {
    return createElement({
        className: 'editor-mask',
        cssText: `
            position: absolute;
            top: 0;
            left: 0;
            transform: translate3d(0, 0, 0);
        `,
    }) as HTMLDivElement;
}

/**
 * @description: 画布遮罩, 用来屏蔽画布事件以及显示组件高亮
 */
export class BoxMask extends Rule {
    public content: HTMLDivElement = createConent(); // 遮罩元素
    public wrapper: HTMLDivElement; // 遮罩元素
    public page: HTMLElement | null = null; // 画布元素
    public scrollTop = 0;
    public scrollLeft = 0;
    public width = 0; // 遮罩的宽度
    public height = 0; // 遮罩的高度
    public wrapperHeight = 0; // wrapper的高宽
    public wrapperWidth = 0; // wrapper的宽度
    public maxScrollTop = 0;
    public maxScrollLeft = 0;

    private mode: Mode = Mode.ABSOLUTE;
    private pageScrollParent: HTMLElement | null = null;
    private intersectionObserver: IntersectionObserver | null = null;
    private wrapperResizeObserver: ResizeObserver | null = null;

    constructor(options?: IRuleOptions) {
        const wrapper = createWrapper();
        super(wrapper, options); // TODO, 画布遮罩规则, 扩展
        this.wrapper = wrapper;

        this.content.addEventListener('wheel', this.mouseWheelHandler);
        this.wrapper.appendChild(this.content);
    }

    public setMode(mode: Mode) {
        this.mode = mode;
        this.scroll();

        this.content.dataset.mode = mode;

        if (mode == Mode.FIXED) {
            this.content.style.width = `${this.wrapperWidth}px`;
            this.content.style.height = `${this.wrapperHeight}px`;
        } else {
            this.content.style.width = `${this.width}px`;
            this.content.style.height = `${this.height}px`;
        }
    }

    /**
	 * 初始化视窗和蒙层监听，监听元素是否在视窗区域、监听mask蒙层所在的wrapper大小变化
	 * @description 初始化视窗和蒙层监听
	 * @param page 页面Dom节点
	 */
    public observe(page: HTMLElement): void {
        if (!page) return;

        this.page = page;
        this.initObserverIntersection();
        this.initObserverWrapper();
    }

    /**
	 * 处理页面大小变更，同步页面和mask大小
	 * @param entries ResizeObserverEntry，获取页面最新大小
	 */
    public pageResize(entries: ResizeObserverEntry[]): void {
        const [entry] = entries;
        const { clientHeight, clientWidth, } = entry.target;
        console.log('pageResize', clientHeight, clientWidth);
        this.setHeight(clientHeight);
        this.setWidth(clientWidth);

        this.scroll();
    }

    /**
	 * 监听一个组件是否在画布可视区域内
	 * @param el 被选中的组件，可能是左侧目录树中选中的
	 */
    public observerIntersection(el: HTMLElement): void {
        this.intersectionObserver?.observe(el);
    }

    /**
	 * 挂载Dom节点
	 * @param el 将蒙层挂载到该Dom节点上
	 */
    public mount(el: HTMLDivElement): void {
        if (!this.content) throw new Error('content 不存在');

        el.appendChild(this.wrapper);
    }

    public setLayout(el: HTMLElement): void {
        this.setMode(isFixedParent(el) ? Mode.FIXED : Mode.ABSOLUTE);
    }

    public scrollIntoView(el: Element) {
        // 不可以有横向滚动
        if (!this.page || el.getBoundingClientRect().left >= this.page.scrollWidth)
            return;

        el.scrollIntoView();
        if (!this.pageScrollParent) return;
        this.scrollLeft = this.pageScrollParent.scrollLeft;
        this.scrollTop = this.pageScrollParent.scrollTop;

        this.scroll();
    }

    public destory() {
        this.content?.remove();
        this.page = null;

        this.pageScrollParent = null;
        this.wrapperResizeObserver?.disconnect();
    }

    /**
	 * 监听选中元素是否在画布可视区域内，如果目标元素不在可视区域内，通过滚动使该元素出现在可视区域
	 */
    private initObserverIntersection() {
        this.pageScrollParent = getScrollParent(this.page as HTMLElement) || null;
        this.intersectionObserver?.disconnect();

        if (typeof IntersectionObserver !== 'undefined') {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const { target, intersectionRatio, } = entry;
                        if (intersectionRatio <= 0) {
                            this.scrollIntoView(target);
                        }
                        this.intersectionObserver?.unobserve(target);
                    });
                },
                {
                    root: this.pageScrollParent,
                    rootMargin: '0px',
                    threshold: 1.0,
                }
            );
        }
    }

    /**
	 * 监听mask的容器大小变化
	 */
    private initObserverWrapper(): void {
        this.wrapperResizeObserver?.disconnect();
        if (typeof ResizeObserver !== 'undefined') {
            this.wrapperResizeObserver = new ResizeObserver((entries) => {
                const [entry] = entries;
                const { clientHeight, clientWidth, } = entry.target;
                this.wrapperHeight = clientHeight;
                this.wrapperWidth = clientWidth;
                this.setMaxScrollLeft();
                this.setMaxScrollTop();
            });
            this.wrapperResizeObserver.observe(this.wrapper);
        }
    }

    private scroll() {
        this.fixScrollValue();
        let { scrollLeft, scrollTop, } = this;

        if (this.pageScrollParent) {
            this.pageScrollParent.scrollTo({
                top: scrollTop,
                left: scrollLeft,
            });
        }

        if (this.mode === Mode.FIXED) {
            scrollLeft = 0;
            scrollTop = 0;
        }

        // this.scrollRule(scrollTop);
        this.scrollTo(scrollLeft, scrollTop);
    }

    private scrollTo(scrollLeft: number, scrollTop: number): void {
        // 遮罩通过 translate控制移动
        this.content.style.transform = `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0)`;

        const event = new CustomEvent<{
            scrollLeft: number;
            scrollTop: number;
        }>('customScroll', {
            detail: {
                scrollLeft: this.scrollLeft,
                scrollTop: this.scrollTop,
            },
        });
        this.content.dispatchEvent(event);
    }

    /**
	 * 设置蒙层高度
	 * @param height 高度
	 */
    private setHeight(height: number): void {
        this.height = height;
        this.setMaxScrollTop();
        this.content.style.height = `${height}px`;
    }

    /**
	 * 设置蒙层宽度
	 * @param width 宽度
	 */
    private setWidth(width: number): void {
        this.width = width;
        this.setMaxScrollLeft();
        this.content.style.width = `${width}px`;
    }

    /**
	 * 计算并设置最大滚动宽度
	 */
    private setMaxScrollLeft(): void {
        this.maxScrollLeft = Math.max(this.width - this.wrapperWidth, 0);
    }

    /**
	 * 计算并设置最大滚动高度
	 */
    private setMaxScrollTop(): void {
        this.maxScrollTop = Math.max(this.height - this.wrapperHeight, 0);
    }

    /**
	 * 修复滚动距离
	 * 由于滚动容器变化等因素，会导致当前滚动的距离不正确
	 */
    private fixScrollValue(): void {
        if (this.scrollTop < 0) this.scrollTop = 0;
        if (this.scrollLeft < 0) this.scrollLeft = 0;
        if (this.maxScrollTop < this.scrollTop) this.scrollTop = this.maxScrollTop;
        if (this.maxScrollLeft < this.scrollLeft)
            this.scrollLeft = this.maxScrollLeft;
    }

    private mouseWheelHandler = (event: WheelEvent) => {
        event.preventDefault();
        if (!this.page) throw new Error('page 未初始化');

        const { deltaY, deltaX, } = event;

        if (this.page.clientHeight < this.wrapperHeight && deltaY) return;
        if (this.page.clientWidth < this.wrapperWidth && deltaX) return;

        if (this.maxScrollTop > 0) {
            this.scrollTop = this.scrollTop + deltaY;
        }

        if (this.maxScrollLeft > 0) {
            this.scrollLeft = this.scrollLeft + deltaX;
        }

        this.scroll();
        this.emit('scroll', event);
    };
}
