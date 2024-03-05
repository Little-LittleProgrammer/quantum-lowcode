import type { BoxCore, MoveableOptions, IGuidesOptions, ContainerHighlightType, ICustomizeMoveableOptionsCallbackConfig, IUpdateDragEl} from '@qimao/quantum-sandbox';
import type { EditorService } from './services/editor-service';
import type { PropsService } from './services/props-service';
import type { UiService } from './services/ui-service';
import { ISchemasRoot, ISchemasPage, ISchemasContainer, ISchemasNode, Id, Fn, IDataSourceSchema } from '@qimao/quantum-schemas';
import { UndoRedo } from './utils/undo-redo';
import { HistoryService } from './services/history-service';
import type {FormSchema} from '@q-front-npm/vue3-antd-pc-ui';
import { Component } from 'vue';
import { ComponentService } from './services/component-service';
import { DataSourceService } from './services/datasource-service';
import { ContentmenuService } from './services/contentmenu-service';
import { StorageService } from './services/storage-serivce';

export interface EventOption {
    label: string;
    value: string;
}

export interface IStoreState {
    root: ISchemasRoot | null;
    page?: ISchemasPage | null;
    parent?: ISchemasContainer | null;
    node?: ISchemasNode | null;
    highlightNode?: ISchemasNode | null;
    nodes?: ISchemasNode[];
    sandbox: BoxCore | null;
    modifiedNodeFields?: Map<Id, Id>;
    pageLength: number;
    disabledMultiSelect: boolean;
}
export type IStoreStateKey = keyof IStoreState;

export interface IServices {
    editorService: EditorService;
    uiService: UiService;
    historyService: HistoryService;
    propsService: PropsService;
    componentService: ComponentService;
    dataSourceService: DataSourceService;
    contentmenuService: ContentmenuService
    storageService: StorageService;
}

export interface IUiState {
    /** 当前点击画布是否触发选中，true: 不触发，false: 触发，默认为false */
    uiSelectMode: boolean;
    /** 是否显示源码编辑器， true: 显示， false: 不显示，默认为false */
    showCode: boolean;
    /** 画布显示放大倍数，默认为 1 */
    zoom: number;
    /** 画布容器的宽高 */
    sandboxContainerRect: ISandboxRect;
    /** 画布顶层div的宽高，可用于改变画布的大小 */
    sandboxRect: ISandboxRect;
    /** 用于控制该属性配置表单内组件的尺寸 */
    // propsPanelSize: 'large' | 'default' | 'small';
    /** 是否显示新增页面按钮 */
    // showAddPageButton: boolean;
    /** 是否显示画布参考线，true: 显示，false: 不显示，默认为true */
    showGuides: boolean;
    workspaceLeft?: number
    workspaceCenter?: number
}

export interface IPropsState {
    tabList: string[],
    propsConfigMap: Record<string, FormConfig>;
    otherConfigMap: Record<string, any>;
    propsValueMap: Record<string, Partial<ISchemasNode>>;
    relateIdMap: Record<Id, Id>;
}

export interface IBoxOptions {
    runtimeUrl?: string;
    autoScrollIntoView?: boolean;
    containerHighlightClassName?: string;
    containerHighlightDuration?: number;
    containerHighlightType?: ContainerHighlightType;
    disabledDragStart?: boolean;
    moveableOptions?: MoveableOptions | ((config?: ICustomizeMoveableOptionsCallbackConfig) => MoveableOptions);
    canSelect?: (el: HTMLElement) => boolean | Promise<boolean>;
    isContainer?: (el: HTMLElement) => boolean | Promise<boolean>;
    updateDragEl?: IUpdateDragEl;
    guidesOptions?: Partial<IGuidesOptions>;
    disabledMultiSelect?: boolean;
}

export interface ISandboxRect {
    width: number;
    height: number;
}

export interface IEditorNodeInfo {
    node: ISchemasNode | ISchemasRoot | null;
    parent: ISchemasContainer | null;
    page: ISchemasPage | null;
}

export interface IInstallOptions {
    parseSchemas: <T = any>(schemas: string) => T;
    [key: string]: any;
}

export interface IMenuButton {
    type: 'button' | 'text' | 'divider';
    icon?: string;
    text?: string;
    disabled?: boolean | (() => boolean);
    tooltip?: string;
    className?: string
    onClick?: () => void;
}

/** 容器布局 */
export enum Layout {
    FLEX = 'flex',
    FIXED = 'fixed',
    RELATIVE = 'relative',
    ABSOLUTE = 'absolute',
}

/** 拖拽类型 */
export enum DragType {
    /** 从组件列表拖到画布 */
    COMPONENT_LIST = 'component-list',
    /** 拖动组件树节点 */
    LAYER_TREE = 'layer-tree',
}

export type IMenuItem =
  | '/'
  | 'delete'
  | 'undo'
  | 'redo'
  | 'zoom'
  | 'zoom-in'
  | 'zoom-out'
  | 'guides'
  | 'rule'
  | 'scale-to-original'
  | 'scale-to-fit'
  | IMenuButton
  //   | MenuComponent
  | string;

/** 当uiService.get('uiSelectMode')为true,点击组件（包括任何形式，组件树/画布）时触发的事件名 */
export const UI_SELECT_MODE_EVENT_NAME = 'ui-select';

export interface StepValue {
    data: ISchemasPage| ISchemasNode;
    modifiedNodeFields: Map<Id, Id>;
    nodeField: Id;
}

export interface IHistoryState {
    pageField?: Id;
    pageSteps: Record<Id, UndoRedo<StepValue>>;
    canRedo: boolean;
    canUndo: boolean;
}
export interface IComponentGroupState {
    list: IComponentGroup[];
}

export interface IComponentGroup {
    /** 显示文案 */
    text: string;
    /** 组内列表 */
    children: IComponentItem[];
}

export interface IComponentItem {
    /** 显示文案 */
    text: string;
    /** 详情，用于tooltip */
    desc?: string;
    /** 组件类型 */
    component: string;
    /** Vue组件或url */
    icon?: string | Component<{}, {}, any>;
    /** 新增组件时需要透传到组价节点上的数据 */
    data?: {
        [key: string]: any;
    };
}

export interface IAddNode {
    type: string;
    label?: string;
    inputEvent?: DragEvent;
    [key: string]: any;
}

export interface IFormValue {
    setValue?: Fn,
    reset?: Fn
}

export interface IDatasourceTypeOption {
    /** 数据源类型 */
    value: string;
    /** 数据源名称 */
    label: string;
}
export type FormConfig = FormSchema<any, 'DataSourceFields' | 'DataSourceMethods' | 'KeyValue' | 'CodeEditor'>[]

export interface IDataSourceState {
    datasourceTypeList: IDatasourceTypeOption[]
    dataSources: IDataSourceSchema[];
    editable: boolean;
    configs: Record<string, FormConfig>;
    values: Record<string, Partial<IDataSourceSchema>>;
    methods: Record<string, EventOption[]>;
}

export type IDataSourceStateKey = keyof IDataSourceState

export enum LayerOffset {
    TOP = 'top',
    BOTTOM = 'bottom',
}

export interface IPastePosition {
    left?: number;
    top?: number;
    /**
     * 粘贴位置X方向偏移量
     */
    offsetX?: number;
    /**
     * 粘贴位置Y方向偏移量
     */
    offsetY?: number;
}

