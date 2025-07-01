import { Mode, ZIndex } from './const';
import { Rule } from './rule';
import {
    createElement,
    isFixedParent,
    getScrollParent
} from '@quantum-lowcode/utils';
import type { IRuleOptions } from './types';

/** 遮罩包装器的CSS类名 */
const wrapperClassName = 'editor-mask-wrapper';

/**
 * 创建遮罩包装器元素
 * 包装器作为遮罩的容器，负责定位和层级管理
 * @returns HTMLDivElement 遮罩包装器元素
 */
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
        `
    }) as HTMLDivElement;

    return el;
}

/**
 * 创建遮罩内容元素
 * 内容元素是实际的遮罩层，用于屏蔽事件和显示高亮
 * @returns HTMLDivElement 遮罩内容元素
 */
function createConent(): HTMLDivElement {
    return createElement({
        className: 'editor-mask',
        cssText: `
            position: absolute;
            top: 0;
            left: 0;
            transform: translate3d(0, 0, 0);
        `
    }) as HTMLDivElement;
}

/**
 * 画布遮罩类
 * 继承自Rule类，提供参考线功能
 *
 * 主要职责：
 * 1. 屏蔽画布事件，防止用户直接操作组件
 * 2. 显示组件选中时的高亮效果
 * 3. 管理遮罩层的滚动行为
 * 4. 处理固定定位和绝对定位两种模式
 * 5. 监听页面和容器尺寸变化
 * 6. 自动滚动到选中组件的可视区域
 * 7. 提供参考线功能（继承自Rule类）
 */
export class BoxMask extends Rule {
    /** 遮罩内容元素，实际的遮罩层 */
    public content: HTMLDivElement = createConent();
    /** 遮罩包装器元素，作为遮罩的容器 */
    public wrapper: HTMLDivElement;
    /** 真实画布页面元素 */
    public page: HTMLElement | null = null;
    /** 垂直滚动距离 */
    public scrollTop = 0;
    /** 水平滚动距离 */
    public scrollLeft = 0;
    /** 遮罩的宽度（与页面宽度同步） */
    public width = 0;
    /** 遮罩的高度（与页面高度同步） */
    public height = 0;
    /** 包装器的高度（编辑器视口高度） */
    public wrapperHeight = 0;
    /** 包装器的宽度（编辑器视口宽度） */
    public wrapperWidth = 0;
    /** 最大垂直滚动距离 */
    public maxScrollTop = 0;
    /** 最大水平滚动距离 */
    public maxScrollLeft = 0;

    /** 遮罩模式：绝对定位或固定定位 */
    private mode: Mode = Mode.ABSOLUTE;
    /** 页面滚动父容器 */
    private pageScrollParent: HTMLElement | null = null;
    /** 交叉观察器，用于监听元素是否在可视区域 */
    private intersectionObserver: IntersectionObserver | null = null;
    /** 包装器尺寸变化观察器 */
    private wrapperResizeObserver: ResizeObserver | null = null;

    constructor(options?: IRuleOptions) {
        const wrapper = createWrapper();
        // 调用父类构造函数，初始化参考线功能
        super(wrapper, options);
        this.wrapper = wrapper;

        // 添加鼠标滚轮事件监听，实现自定义滚动控制
        this.content.addEventListener('wheel', this.mouseWheelHandler);
        this.wrapper.appendChild(this.content);
    }

    /**
     * 设置遮罩模式
     * 根据选中元素的定位方式决定遮罩的工作模式
     * @param mode 遮罩模式（绝对定位或固定定位）
     */
    public setMode(mode: Mode) {
        this.mode = mode;
        this.scroll();

        // 设置数据属性，便于CSS样式控制
        this.content.dataset.mode = mode;

        // 根据模式设置遮罩尺寸
        if (mode == Mode.FIXED) {
            // 固定定位模式：遮罩尺寸与视口一致
            this.content.style.width = `${this.wrapperWidth}px`;
            this.content.style.height = `${this.wrapperHeight}px`;
        } else {
            // 绝对定位模式：遮罩尺寸与页面一致
            this.content.style.width = `${this.width}px`;
            this.content.style.height = `${this.height}px`;
        }
    }

    /**
	 * 初始化视窗和蒙层监听
	 * 监听元素是否在视窗区域、监听mask蒙层所在的wrapper大小变化
	 * @param page 页面Dom节点
	 */
    public observe(page: HTMLElement): void {
        if (!page) return;
        this.page = page;
        // 初始化交叉观察器，监听元素可视性
        this.initObserverIntersection();
        // 初始化尺寸观察器，监听包装器大小变化
        this.initObserverWrapper();
    }

    /**
	 * 处理页面大小变更，同步页面和mask大小
	 * 当页面内容尺寸发生变化时，需要同步更新遮罩层的尺寸
	 * @param entries ResizeObserverEntry数组，包含页面最新尺寸信息
	 */
    public pageResize(entries: ResizeObserverEntry[]): void {
        // 安全检查：确保entries数组不为空
        if (!entries || entries.length === 0) return;

        const [entry] = entries;
        const target = entry?.target as HTMLElement;
        const { clientHeight, clientWidth, offsetLeft } = target;

        console.log('pageResize', clientHeight, clientWidth);
        // 同步更新遮罩层尺寸
        this.setHeight(clientHeight);
        this.setWidth(clientWidth);
        // 同步页面偏移位置
        this.content.style.left = `${offsetLeft}px`;
        // 重新计算滚动
        this.scroll();
    }

    /**
	 * 监听一个组件是否在画布可视区域内
	 * 当组件不在可视区域时，会自动滚动使其可见
	 * @param el 被选中的组件，可能是左侧目录树中选中的
	 */
    public observerIntersection(el: HTMLElement): void {
        this.intersectionObserver?.observe(el);
    }

    /**
	 * 挂载Dom节点
	 * 将遮罩层挂载到编辑器容器中
	 * @param el 将蒙层挂载到该Dom节点上
	 */
    public mount(el: HTMLDivElement): void {
        if (!this.content) throw new Error('content 不存在');

        el.appendChild(this.wrapper);
    }

    /**
     * 根据选中元素设置遮罩布局模式
     * 自动检测元素的定位方式并设置对应的遮罩模式
     * @param el 选中的元素
     */
    public setLayout(el: HTMLElement): void {
        // 检测元素是否有固定定位的父元素
        this.setMode(isFixedParent(el) ? Mode.FIXED : Mode.ABSOLUTE);
    }

    /**
     * 滚动到指定元素，使其在可视区域内显示
     * @param el 要滚动到的目标元素
     */
    public scrollIntoView(el: Element) {
        // 检查是否需要横向滚动（避免不必要的滚动）
        if (!this.page || el.getBoundingClientRect().left >= this.page.scrollWidth)
            return;

        // 使用浏览器原生滚动API
        el.scrollIntoView();

        if (!this.pageScrollParent) return;

        // 同步滚动状态到遮罩层
        this.scrollLeft = this.pageScrollParent.scrollLeft;
        this.scrollTop = this.pageScrollParent.scrollTop;

        this.scroll();
    }

    /**
     * 销毁遮罩实例，清理所有资源
     */
    public destory() {
        // 移除DOM元素
        this.content?.remove();
        // 清空引用
        this.page = null;
        this.pageScrollParent = null;
        // 断开观察器
        this.wrapperResizeObserver?.disconnect();
    }

    /**
	 * 监听选中元素是否在画布可视区域内
	 * 如果目标元素不在可视区域内，通过滚动使该元素出现在可视区域
	 */
    private initObserverIntersection() {
        // 获取页面的滚动父容器
        this.pageScrollParent = getScrollParent(this.page as HTMLElement) || null;
        // 断开之前的观察器
        this.intersectionObserver?.disconnect();

        // 创建交叉观察器
        if (typeof IntersectionObserver !== 'undefined') {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const { target, intersectionRatio } = entry;
                        // 如果元素完全不可见，则滚动到该元素
                        if (intersectionRatio <= 0) {
                            this.scrollIntoView(target);
                        }
                        // 停止观察该元素（一次性操作）
                        this.intersectionObserver?.unobserve(target);
                    });
                },
                {
                    // 观察根元素为页面滚动容器
                    root: this.pageScrollParent,
                    rootMargin: '0px',
                    // 阈值为1.0，即元素完全可见时才不触发回调
                    threshold: 1.0
                }
            );
        }
    }

    /**
	 * 监听mask的容器大小变化
	 * 当编辑器视口大小改变时，需要重新计算滚动范围
	 */
    private initObserverWrapper(): void {
        // 断开之前的观察器
        this.wrapperResizeObserver?.disconnect();

        if (typeof ResizeObserver !== 'undefined') {
            this.wrapperResizeObserver = new ResizeObserver((entries) => {
                // 安全检查：确保entries数组不为空
                if (!entries || entries.length === 0) return;

                const [entry] = entries;
                const { clientHeight, clientWidth } = entry!.target;

                // 更新包装器尺寸
                this.wrapperHeight = clientHeight;
                this.wrapperWidth = clientWidth;

                // 重新计算最大滚动距离
                this.setMaxScrollLeft();
                this.setMaxScrollTop();
            });
            // 观察包装器元素的尺寸变化
            this.wrapperResizeObserver.observe(this.wrapper);
        }
    }

    /**
     * 执行滚动操作
     * 统一处理滚动逻辑，包括滚动值修正和实际滚动执行
     */
    private scroll() {
        // 修正滚动值，确保在合理范围内
        this.fixScrollValue();
        let { scrollLeft, scrollTop } = this;

        // 如果有页面滚动容器，同步滚动
        if (this.pageScrollParent) {
            this.pageScrollParent.scrollTo({
                top: scrollTop,
                left: scrollLeft
            });
        }

        // 固定定位模式下，遮罩不需要滚动
        if (this.mode === Mode.FIXED) {
            scrollLeft = 0;
            scrollTop = 0;
        }

        // 执行遮罩层的滚动变换
        this.scrollTo(scrollLeft, scrollTop);
    }

    /**
     * 通过CSS变换实现遮罩层滚动
     * @param scrollLeft 水平滚动距离
     * @param scrollTop 垂直滚动距离
     */
    private scrollTo(scrollLeft: number, scrollTop: number): void {
        // 遮罩通过 translate3d 控制移动（硬件加速）
        this.content.style.transform = `translate3d(${-scrollLeft}px, ${-scrollTop}px, 0)`;

        // 派发自定义滚动事件，供其他组件监听
        const event = new CustomEvent<{
            scrollLeft: number;
            scrollTop: number;
        }>('customScroll', {
            detail: {
                scrollLeft: this.scrollLeft,
                scrollTop: this.scrollTop
            }
        });
        this.content.dispatchEvent(event);
    }

    /**
	 * 设置蒙层高度
	 * @param height 高度值（像素）
	 */
    private setHeight(height: number): void {
        this.height = height;
        // 重新计算最大垂直滚动距离
        this.setMaxScrollTop();
        // 应用样式
        this.content.style.height = `${height}px`;
    }

    /**
	 * 设置蒙层宽度
	 * @param width 宽度值（像素）
	 */
    private setWidth(width: number): void {
        this.width = width;
        // 重新计算最大水平滚动距离
        this.setMaxScrollLeft();
        // 应用样式
        this.content.style.width = `${width}px`;
    }

    /**
	 * 计算并设置最大水平滚动距离
	 * 最大滚动距离 = 内容宽度 - 视口宽度
	 */
    private setMaxScrollLeft(): void {
        this.maxScrollLeft = Math.max(this.width - this.wrapperWidth, 0);
    }

    /**
	 * 计算并设置最大垂直滚动距离
	 * 最大滚动距离 = 内容高度 - 视口高度
	 */
    private setMaxScrollTop(): void {
        this.maxScrollTop = Math.max(this.height - this.wrapperHeight, 0);
    }

    /**
	 * 修复滚动距离
	 * 由于滚动容器变化等因素，会导致当前滚动的距离不正确
	 * 确保滚动值在有效范围内
	 */
    private fixScrollValue(): void {
        // 确保滚动值不小于0
        if (this.scrollTop < 0) this.scrollTop = 0;
        if (this.scrollLeft < 0) this.scrollLeft = 0;

        // 确保滚动值不超过最大值
        if (this.maxScrollTop < this.scrollTop) this.scrollTop = this.maxScrollTop;
        if (this.maxScrollLeft < this.scrollLeft)
            this.scrollLeft = this.maxScrollLeft;
    }

    /**
     * 鼠标滚轮事件处理函数
     * 实现自定义的滚动控制逻辑
     */
    private mouseWheelHandler = (event: WheelEvent) => {
        // 阻止默认滚动行为
        event.preventDefault();
        if (!this.page) throw new Error('page 未初始化');

        // 获取滚轮滚动的增量值
        const { deltaY, deltaX } = event;

        // 如果内容高度小于视口高度，不处理垂直滚动
        if (this.page.clientHeight < this.wrapperHeight && deltaY) return;
        // 如果内容宽度小于视口宽度，不处理水平滚动
        if (this.page.clientWidth < this.wrapperWidth && deltaX) return;

        // 更新垂直滚动位置
        if (this.maxScrollTop > 0) {
            this.scrollTop = this.scrollTop + deltaY;
        }

        // 更新水平滚动位置
        if (this.maxScrollLeft > 0) {
            this.scrollLeft = this.scrollLeft + deltaX;
        }

        // 执行滚动
        this.scroll();
        // 触发滚动事件
        this.emit('scroll', event);
    };
}
