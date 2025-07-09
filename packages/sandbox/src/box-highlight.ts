/**
 * 画布高亮组件
 * 负责处理鼠标悬停时的组件高亮效果
 *
 * 主要功能：
 * 1. 在鼠标悬停时显示组件的高亮边框
 * 2. 使用 Moveable 库创建可视化的高亮效果
 * 3. 通过 TargetShadow 管理高亮元素的阴影表示
 * 4. 提供高亮和清除高亮的操作接口
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
    /** 当前高亮的目标元素 */
    public target?: HTMLElement;
    /** Moveable 实例，用于创建高亮边框效果 */
    public moveable?: Moveable;
    /** 目标阴影实例，用于创建目标元素的阴影副本 */
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
     * @param el 要高亮的组件DOM元素 - 原本的el，不是shadowEl
     */
    public highlight(el: HTMLElement) {
        console.log('highlight', el);
        // 如果元素不存在或者已经是当前高亮的元素，则不处理
        if (!el || el === this.target) return;

        // 设置当前高亮目标
        this.target = el;

        // 更新目标阴影，创建该元素的阴影副本
        this.targetShadow?.update(el);

        // 如果已经有 Moveable 实例，直接更新
        if (this.moveable) {
            this.moveable.zoom = 2; // 设置缩放比例
            this.moveable.updateRect(); // 更新矩形位置
        } else {
            // 创建新的 Moveable 实例
            this.moveable = new Moveable(this.container, {
                target: this.targetShadow?.el, // 目标是阴影元素 shadowEl
                origin: false, // 不显示原点
                rootContainer: this.getRootContainer(), // 根容器
                zoom: 2 // 缩放比例
            });
        }
    }

    /**
     * 清空高亮效果
     * 隐藏当前的高亮边框
     */
    public clearHighlight() {
        // 如果没有 Moveable 实例或没有目标元素，则不处理
        if (!this.moveable || !this.target) return;

        // 设置缩放为0来隐藏高亮效果
        this.moveable.zoom = 0;
        this.moveable.updateRect();

        // 清空目标元素引用
        this.target = undefined;
    }

    /**
     * 销毁实例
     * 清理所有资源和引用
     */
    public destroy(): void {
        // 销毁 Moveable 实例
        this.moveable?.destroy();
        // 销毁目标阴影实例
        this.targetShadow?.destroy();

        // 清空引用
        this.moveable = undefined;
        this.targetShadow = undefined;
    }
}
