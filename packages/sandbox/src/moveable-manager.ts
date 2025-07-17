import {
    Subscribe,
    createElement,
    isFunction,
    isString,
    js_utils_deep_merge,
    js_utils_dom_offset
} from '@quantum-lowcode/utils';
import { AbleActionEventType, GuidesType, Mode } from './const';
import type {
    ElementGuidelineValueOption,
    MoveableOptions,
    MoveableRefType
} from 'moveable';
import type { GetContainer, IMoveableManagerConfig } from './types';
import type { Fn } from '@quantum-lowcode/schemas';
import { moveableMenu } from './moveable-menu';

/**
 * Moveable管理器类
 * 负责管理可移动、可缩放元素的交互行为，包括拖拽、缩放、对齐等功能
 * 支持多种布局模式：流式布局、绝对定位、固定定位
 */
export class MoveableManager extends Subscribe {
    /** 布局方式：流式布局、绝对定位、固定定位 */
    public mode: Mode = Mode.ABSOLUTE;

    /** 布局容器 - 用于承载可移动元素的容器 */
    protected container: HTMLElement;

    /** Moveable配置选项 - 存储当前生效的moveable配置 */
    protected options: MoveableOptions = {};

    /** 水平参考线 - 用于元素水平对齐的参考线坐标数组 */
    private horizontalGuidelines: number[] = [];

    /** 垂直参考线 - 用于元素垂直对齐的参考线坐标数组 */
    private verticalGuidelines: number[] = [];

    /** 对齐元素集合 - 用于辅助对齐的元素列表 */
    private elementGuidelines: HTMLElement[] = [];

    /** 由外部调用方（编辑器）传入进来的moveable默认参数，可以为空，也可以是一个回调函数 */
    private customizedOptions?: (() => MoveableOptions) | MoveableOptions;

    /** 获取整个画布的根元素（mount函数中挂载的container） */
    private getRootContainer: GetContainer;

    /**
     * 构造函数
     * @param config Moveable管理器配置参数
     */
    constructor(config: IMoveableManagerConfig) {
        super();
        this.customizedOptions = config.moveableOptions;
        this.container = config.container;
        this.getRootContainer = config.getRootContainer;
    }

    /**
     * 获取Moveable配置选项中的特定配置项
     * @param key 配置项的键名
     * @returns 对应的配置值
     */
    public getOption<K extends keyof MoveableOptions>(
        key: K
    ): MoveableOptions[K] {
        return this.options[key];
    }

    /**
	 * 设置水平/垂直参考线
	 * @param type 参考线类型 - 水平或垂直
	 * @param guidelines 参考线坐标数组 - 像素坐标值
	 */
    public setGuidelines(type: GuidesType, guidelines: number[]): void {
        console.log('参考线', type, guidelines);
        if (type === GuidesType.HORIZONTAL) {
            this.horizontalGuidelines = guidelines;
        } else if (type === GuidesType.VERTICAL) {
            this.verticalGuidelines = guidelines;
        }
        // 触发moveable更新事件
        this.emit('update-moveable');
    }

    /**
	 * 清除横向和纵向的参考线
	 * 重置所有参考线为空数组，并触发更新
	 */
    public clearGuides(): void {
        this.horizontalGuidelines = [];
        this.verticalGuidelines = [];

        this.emit('update-moveable');
    }

    /**
	 * 设置对齐元素集合
	 * 用于设置选中元素周围可用于对齐的其他元素
	 * @param elements 对齐元素集合 - 当前选中的元素列表
	 */
    protected setElementGuidelines(elements: HTMLElement[]): void {
        // 移除之前创建的对齐辅助元素
        this.elementGuidelines.forEach((node) => {
            node.remove();
        });
        this.elementGuidelines = [];

        // 设置选中元素的周围元素，用于选中元素跟周围元素对齐辅助
        const elementGuidelines: Array<
        ElementGuidelineValueOption | MoveableRefType<Element>
        > =
			this.getCustomizeOptions()?.elementGuidelines ||
			Array.from(elements[0]?.parentElement?.children || []);

        // 只在绝对定位模式下创建对齐辅助元素
        if (this.mode === Mode.ABSOLUTE) {
            this.container.append(
                this.createGuidelineElements(elements, elementGuidelines)
            );
        }
    }

    /**
     * 获取moveable参数
     * 合并默认参数、自定义参数和运行时参数
     * @param isMultiSelect 是否多选模式 - 影响可用的操作类型
     * @param runtimeOptions 调用时实时传进来的的moveable参数 - 可覆盖默认配置
     * @returns moveable所需参数 - 完整的配置对象
     */
    protected getOptions(isMultiSelect: boolean, runtimeOptions: MoveableOptions = {}): MoveableOptions {
        const defaultOptions = this.getDefaultOptions(isMultiSelect);
        const customizedOptions = this.getCustomizeOptions();

        // 深度合并各层配置：默认配置 < 自定义配置 < 运行时配置
        this.options = js_utils_deep_merge(js_utils_deep_merge(defaultOptions, customizedOptions), runtimeOptions);
        return this.options;
    }

    /**
	 * 获取单选和多选的moveable公共参数
	 * @param isMultiSelect 是否为多选模式
	 * @returns moveable公共参数 - 包含拖拽、缩放、对齐等基础配置
	 */
    private getDefaultOptions(isMultiSelect: boolean): MoveableOptions {
        const isSortable = this.mode === Mode.SORTABLE;

        // 公共配置参数
        const commonOptions = {
            draggable: true, // 启用拖拽
            resizable: true, // 启用缩放
            rootContainer: this.getRootContainer(), // 根容器
            zoom: 1, // 缩放比例
            throttleDrag: 0, // 拖拽节流时间
            snappable: true, // 启用对齐
            horizontalGuidelines: this.horizontalGuidelines, // 水平参考线
            verticalGuidelines: this.verticalGuidelines, // 垂直参考线
            elementGuidelines: this.elementGuidelines, // 元素对齐参考
            bounds: {
                top: 0,
                left: 0,
                right: this.container.clientWidth,
                // 可排序模式下不限制底部边界
                bottom: isSortable ? undefined : this.container.clientHeight
            }
        };

        // 根据选择模式获取差异化配置
        const differenceOptions = isMultiSelect
            ? this.getMultiOptions()
            : this.getSingleOptions();

        return js_utils_deep_merge(commonOptions, differenceOptions);
    }

    /**
	 * 获取单选下的差异化参数
	 * 单选模式下支持更多精细化的操作和对齐功能
	 * @returns {MoveableOptions} moveable options参数
	 */
    private getSingleOptions(): MoveableOptions {
        const isAbsolute = this.mode === Mode.ABSOLUTE;
        const isFixed = this.mode === Mode.FIXED;

        return {
            origin: false, // 不显示原点
            dragArea: false, // 不显示拖拽区域
            scalable: false, // 不启用缩放控制
            rotatable: false, // 不启用旋转控制
            snapGap: isAbsolute || isFixed, // 绝对/固定定位下启用对齐间隙
            snapThreshold: 5, // 对齐阈值：5像素
            snapDigit: 0, // 对齐精度
            isDisplaySnapDigit: isAbsolute, // 绝对定位下显示对齐数字
            // 对齐方向配置 - 绝对定位下启用所有方向
            snapDirections: {
                top: isAbsolute,
                right: isAbsolute,
                bottom: isAbsolute,
                left: isAbsolute,
                center: isAbsolute,
                middle: isAbsolute
            },
            // 元素对齐方向配置
            elementSnapDirections: {
                top: isAbsolute,
                right: isAbsolute,
                bottom: isAbsolute,
                left: isAbsolute
            },
            isDisplayInnerSnapDigit: true, // 显示内部对齐数字
            dragTarget: '.moveable-drag-area-button', // 拖拽目标选择器
            dragTargetSelf: true, // 允许自身作为拖拽目标
            props: {
                actions: true // 启用操作菜单
            },
            // 自定义功能：右键菜单
            ables: [moveableMenu(this.actionHandler.bind(this))]
        };
    }

    /**
	 * 获取多选下的差异化参数
	 * 多选模式下支持组操作功能
	 * @returns {MoveableOptions} moveable options参数
	 */
    private getMultiOptions(): MoveableOptions {
        return {
            defaultGroupRotate: 0, // 默认组旋转角度
            defaultGroupOrigin: '50% 50%', // 默认组原点位置
            startDragRotate: 0, // 开始拖拽时的旋转角度
            throttleDragRotate: 0, // 旋转拖拽节流
            origin: true, // 显示原点
            padding: { left: 0, top: 0, right: 0, bottom: 0 } // 内边距
        };
    }

    /**
     * 操作事件处理器
     * 这是给selectParentAbles的回调函数，用于触发选中父元素事件
     * @param type 操作事件类型
     */
    private actionHandler(type: AbleActionEventType): void {
        this.emit(type);
    }

    /**
	 * 获取业务方自定义的moveable参数
	 * 支持静态配置对象或动态配置函数
	 * @returns 自定义配置选项
	 */
    private getCustomizeOptions(): MoveableOptions | undefined {
        if (typeof this.customizedOptions === 'function') {
            return this.customizedOptions();
        }
        return this.customizedOptions;
    }

    /**
	 * 为需要辅助对齐的元素创建div
	 * 在绝对定位模式下，为其他元素创建辅助对齐的虚拟元素
	 * @param selectedElList 选中的元素列表，需要排除在对齐元素之外
	 * @param allElList 全部元素列表 - 可能的对齐目标元素
	 * @returns frame 辅助对齐元素集合的页面片段
	 */
    private createGuidelineElements(
        selectedElList: HTMLElement[],
        allElList: Array<ElementGuidelineValueOption | MoveableRefType<Element>>
    ): DocumentFragment {
        const frame = globalThis.document.createDocumentFragment();

        for (const element of allElList) {
            // 获取实际的DOM元素
            let node =
				(element as ElementGuidelineValueOption).element ||
				(element as MoveableRefType<Element>);

            if (!node || isString(node)) continue;

            // 如果是函数，则调用获取元素
            if (isFunction(node)) {
                node = (node as Fn)();
            }

            // 排除已选中的元素
            if (this.isInElementList(node as Element, selectedElList)) continue;

            const { width, height } = (node as Element).getBoundingClientRect();

            // 跳过无尺寸的元素
            if (!width || !height) continue;

            // 获取元素的绝对位置
            const { left, top } = js_utils_dom_offset(node as HTMLElement);

            // 创建辅助对齐的虚拟元素
            const elementGuideline = createElement({
                cssText: `position: absolute;width: ${width}px;height: ${height}px;top: ${top}px;left: ${left}px`,
                className: ''
            });
            this.elementGuidelines.push(elementGuideline);
            frame.append(elementGuideline);
        }
        return frame;
    }

    /**
	 * 判断一个元素是否在元素列表里面
	 * 用于检查元素是否已被选中，避免重复处理
	 * @param ele 要检查的元素
	 * @param eleList 元素列表
	 * @returns 是否在元素列表里面
	 */
    private isInElementList(ele: Element, eleList: Element[]): boolean {
        for (const eleItem of eleList) {
            if (ele === eleItem) return true;
        }
        return false;
    }
}
