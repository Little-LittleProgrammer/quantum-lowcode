/**
 * 画布高亮组件
 * 负责处理鼠标悬停时的组件高亮效果
 *
 * 主要功能：
 * 1. 在鼠标悬停时显示组件的高亮边框
 * 2. 使用 Moveable 库创建可视化的高亮效果
 * 3. 通过 TargetShadow 管理高亮元素的阴影表示
 * 4. 提供高亮和清除高亮的操作接口
 *
 * 实现原理：
 * - 创建目标元素的阴影副本（TargetShadow）
 * - 在阴影副本上使用 Moveable 实例创建高亮边框
 * - 通过控制 Moveable 的 zoom 属性来显示/隐藏高亮效果
 */

import { Subscribe } from '@quantum-lowcode/utils';
import Moveable from 'moveable';
import { TargetShadow } from './target-shadow';
import type { GetContainer, IBoxHighlightConfig } from './types';
import { HIGHLIGHT_EL_ID_PREFIX, ZIndex } from './const';

/**
 * 画布高亮管理类
 * 负责管理鼠标悬停时的组件高亮效果
 *
 * 工作流程：
 * 1. 接收要高亮的目标元素
 * 2. 创建目标元素的阴影副本（TargetShadow）
 * 3. 使用 Moveable 在阴影副本上创建高亮边框
 * 4. 支持清除高亮效果
 */
export class BoxHighlight extends Subscribe {
    /** 高亮容器，通常是画布遮罩层 */
    public container: HTMLElement;

    /** 当前高亮的目标元素（原始元素，不是阴影元素） */
    public target?: HTMLElement;

    /**
     * Moveable 实例，用于创建高亮边框效果
     * 这是高亮功能的核心，通过控制其 zoom 属性来显示/隐藏高亮
     */
    public moveable?: Moveable;

    /**
     * 目标阴影实例，用于创建目标元素的阴影副本
     * 为什么需要阴影副本？
     * - 避免直接操作原始DOM元素
     * - 在遮罩层中创建独立的高亮表示
     * - 不影响原始元素的事件处理
     */
    public targetShadow?: TargetShadow;

    /** 获取根容器的方法，用于 Moveable 的 rootContainer 配置 */
    private getRootContainer: GetContainer;

    /**
     * 构造函数
     * @param config 高亮配置对象
     */
    constructor(config: IBoxHighlightConfig) {
        super();
        this.container = config.container;
        this.getRootContainer = config.getRootContainer;

        // 创建目标阴影实例
        // 用于在遮罩层中创建目标元素的阴影副本
        this.targetShadow = new TargetShadow({
            container: this.container,
            updateDragEl: config.updateDragEl,
            idPrefix: HIGHLIGHT_EL_ID_PREFIX, // 高亮元素的ID前缀
            zIndex: ZIndex.HIGHLIGHT_EL // 高亮元素的层级
        });
    }

    /**
     * 高亮鼠标悬停组件
     * 在指定元素上显示高亮边框效果
     *
     * 实现步骤：
     * 1. 检查元素有效性，避免重复处理
     * 2. 更新目标阴影，创建阴影副本
     * 3. 创建或复用 Moveable 实例
     * 4. 设置 zoom 为 2 显示高亮边框
     *
     * @param el 要高亮的组件DOM元素 - 原本的el，不是shadowEl
     */
    public highlight(el: HTMLElement) {
        // 防护：如果元素不存在或者已经是当前高亮的元素，则不处理
        if (!el || el === this.target) return;

        // 设置当前高亮目标
        this.target = el;

        // 更新目标阴影，创建该元素的阴影副本
        // 这一步会在遮罩层中创建与原始元素相同位置和大小的阴影元素
        this.targetShadow?.update(el);

        // 检查是否已经有 Moveable 实例
        if (this.moveable) {
            // 性能优化：如果实例已存在，直接更新配置
            // zoom = 2: 设置缩放比例为2倍，使高亮边框清晰可见
            this.moveable.zoom = 2;
            // 更新矩形位置和大小，确保高亮边框与目标元素完全对齐
            this.moveable.updateRect();
        } else {
            // 首次创建 Moveable 实例
            this.moveable = new Moveable(this.container, {
                target: this.targetShadow?.el, // 目标是阴影元素 shadowEl，不是原始元素
                origin: false, // 不显示变换原点
                rootContainer: this.getRootContainer(), // 根容器
                zoom: 2 // 缩放比例设为2倍，使高亮边框更明显
            });
        }
    }

    /**
     * 清空高亮效果
     * 隐藏当前的高亮边框
     *
     * 实现原理：
     * 通过将 Moveable 的 zoom 属性设置为 0，实现视觉上的完全隐藏
     *
     * 为什么 zoom = 0 能隐藏高亮？
     * - zoom 控制 Moveable 控制框的缩放级别
     * - 当 zoom = 0 时，控制框被缩放到 0 倍大小
     * - 视觉上完全隐藏，但实例仍然存在
     * - 比销毁重建实例更高效
     */
    public clearHighlight() {
        // 防护：如果没有 Moveable 实例或没有目标元素，则不处理
        if (!this.moveable || !this.target) return;

        // 核心逻辑：设置缩放为0来隐藏高亮效果
        // 这里不是设置 display: none 或 visibility: hidden
        // 而是通过缩放到0倍大小来实现隐藏，性能更好
        this.moveable.zoom = 0;

        // 更新矩形位置，应用缩放变化
        this.moveable.updateRect();

        // 清空目标元素引用，标记当前没有高亮目标
        this.target = undefined;
    }

    /**
     * 销毁实例
     * 清理所有资源和引用，防止内存泄漏
     */
    public destroy(): void {
        // 销毁 Moveable 实例
        this.moveable?.destroy();

        // 销毁目标阴影实例
        this.targetShadow?.destroy();

        // 清空引用，帮助垃圾回收
        this.moveable = undefined;
        this.targetShadow = undefined;
    }
}
