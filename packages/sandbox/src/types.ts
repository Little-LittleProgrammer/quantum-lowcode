import type { LowCodeRoot } from '@qimao/quantum-core';
import type {
    ISchemasContainer,
    ISchemasNode,
    ISchemasRoot,
    Id
} from '@qimao/quantum-schemas';
import type { MoveableOptions } from 'moveable';
import { ContainerHighlightType, ZIndex } from './const';
import DragResizeHelper from './box-drag-resize-helper';

export interface IRuntime {
    getApp?: () => LowCodeRoot | undefined;
    beforeSelect?: (el: HTMLElement) => Promise<boolean> | boolean;
    updateRootConfig?: (config: ISchemasRoot) => void;
    updatePageField?: (id: Id) => void;
    select?: (id: Id) => Promise<HTMLElement> | HTMLElement;
    add?: (data: IUpdateData) => void;
    update?: (data: IUpdateData) => void;
    sortNode?: (data: ISortEventData) => void;
    delete?: (data: IDeleteData) => void;
}

export interface IQuantum {
    /** 当前页面的根节点变化时调用该方法，编辑器会同步该el和stage的大小
	 * 同步mask和el的大小
	 * 该方法由stage注入到iframe.contentWindow中 */
    onPageElUpdate: (el: HTMLElement) => void;

    onRuntimeReady: (runtime: IRuntime) => void;
}

export type IRect = {
    width: number;
    height: number;
} & IOffset;

export interface IOffset {
    left: number;
    top: number;
}
export interface IPoint {
    clientX: number;
    clientY: number;
}

export interface IRuntimeWindow extends Window {
    quantum: IQuantum;
}

/** 将组件添加到容器的方式 */
export enum IContainerHighlightType {
    /** 默认方式：组件在容器上方悬停一段时间后加入 */
    DEFAULT = 'default',
    /** 按住alt键，并在容器上方悬停一段时间后加入 */
    ALT = 'alt',
}

export type ITargetElement = HTMLElement | SVGElement;

/** 业务方自定义的moveableOptions，可以是配置，也可以是回调函数 */
export type ICustomizeMoveableOptions =
	| ((config?: ICustomizeMoveableOptionsCallbackConfig) => MoveableOptions)
	| MoveableOptions
	| undefined;

export type ICanSelect = (
    el: HTMLElement,
    event: MouseEvent,
    stop: () => boolean
) => boolean | Promise<boolean>;
export type IsContainer = (el: HTMLElement) => boolean | Promise<boolean>;
export type GetContainer = () => HTMLDivElement | undefined;
export type GetRenderDocument = () => Document | undefined;
/** render提供的接口，通过坐标获得坐标下所有HTML元素数组 */
export type GetElementsFromPoint = (point: IPoint) => HTMLElement[];
export type DelayedMarkContainer = (event: MouseEvent, exclude: Element[]) => NodeJS.Timeout | undefined;
export type GetTargetElement = (idOrEl: Id | HTMLElement) => HTMLElement;
export type IUpdateDragEl = (
    el: ITargetElement,
    target: ITargetElement,
    container: HTMLElement
) => void;

export interface IBoxCoreConfig {
    /** 需要对齐的dom节点的CSS选择器字符串 */
    snapElementQuerySelector?: string;
    // HTML地址，可以是一个HTTP地址，如果和编辑器不同域，需要设置跨域，也可以是一个相对或绝对路径
    runtimeUrl?: string;
    // 画布缩放
    zoom?: number;
    autoScrollIntoView?: boolean;
    containerHighlightClassName?: string;
    containerHighlightDuration?: number;
    containerHighlightType?: IContainerHighlightType;
    disabledDragStart?: boolean;
    moveableOptions?: ICustomizeMoveableOptions;
    canSelect?: ICanSelect;
    isContainer?: IsContainer;
    updateDragEl?: IUpdateDragEl;
    guidesOptions?: Partial<IGuidesOptions>;
    disabledMultiSelect?: boolean;
}

export interface ICustomizeMoveableOptionsCallbackConfig {
    targetEl?: HTMLElement;
    targetElId?: string;
    targetEls?: HTMLElement[];
    targetElIds?: string[];
    isMulti: boolean;
    document?: Document;
}

export interface IUpdateData {
    config: ISchemasNode;
    parent?: ISchemasContainer;
    parentId?: Id;
    root: ISchemasRoot;
}

export interface IDeleteData {
    id: Id;
    parentId: Id;
    root: ISchemasRoot;
}

export interface ISortEventData {
    src: Id;
    dist: Id;
    root?: ISchemasRoot;
}

export interface IPoint {
    clientX: number;
    clientY: number;
}

export interface IGuidesOptions {
    [key: string]: any;
}

export interface IRuleOptions {
    guidesOptions?: Partial<IGuidesOptions>;
}

export interface IBoxDragResizeConfig {
    container: HTMLElement;
    dragResizeHelper: DragResizeHelper;
    moveableOptions?: ICustomizeMoveableOptions;
    disabledDragStart?: boolean;
    getRootContainer: GetContainer;
    getRenderDocument: GetRenderDocument;
    markContainerEnd: GetContainer;
    delayedMarkContainer: DelayedMarkContainer;
}

export interface IActionManagerConfig {
    container: HTMLElement;
    containerHighlightClassName?: string;
    containerHighlightDuration?: number;
    containerHighlightType?: ContainerHighlightType;
    moveableOptions?: ICustomizeMoveableOptions;
    disabledDragStart?: boolean;
    disabledMultiSelect?: boolean;
    canSelect?: ICanSelect;
    isContainer?: IsContainer;
    getRootContainer: GetContainer;
    getRenderDocument: GetRenderDocument;
    updateDragEl?: IUpdateDragEl;
    getTargetElement: GetTargetElement;
    getElementsFromPoint: GetElementsFromPoint;
}

export interface IUpdateEventData {
    data: {
        el: HTMLElement;
        style: {
            width?: number;
            height?: number;
            left?: number;
            top?: number;
            transform?: {
                rotate?: string;
                scale?: string;
            };
        };
        ghostEl?: HTMLElement;
    }[];
    parentEl: HTMLElement | null;
}

export interface IBoxHighlightConfig {
    container: HTMLElement;
    updateDragEl?: IUpdateDragEl;
    getRootContainer: GetContainer;
}

export interface IDragResizeHelperConfig {
    container: HTMLElement;
    updateDragEl?: IUpdateDragEl;
}

export interface ITargetShadowConfig {
    container: HTMLElement;
    zIndex?: ZIndex;
    updateDragEl?: IUpdateDragEl;
    idPrefix?: string;
}

export interface IMoveableManagerConfig {
    container: HTMLElement;
    moveableOptions?: ICustomizeMoveableOptions;
    getRootContainer: GetContainer;
}
