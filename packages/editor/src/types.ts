import type { BoxCore } from '@qimao/quantum-sandbox';
import type { EditorService } from './services/editor-service';
import type { UiService } from './services/ui-service';
import { ISchemasRoot, ISchemasPage, ISchemasContainer, ISchemasNode, Id } from '@qimao/quantum-schemas';
import { IGuidesOptions, IContainerHighlightType, ICustomizeMoveableOptionsCallbackConfig, IUpdateDragEl } from '@qimao/quantum-sandbox/src/types';
import { UndoRedo } from './utils/undo-redo';

export interface IStoreState {
    root: ISchemasRoot | null;
    page?: ISchemasPage | null;
    parent?: ISchemasContainer | null;
    node?: ISchemasNode | null;
    highlightNode?: ISchemasNode | null;
    nodes?: ISchemasNode[];
    sandbox: BoxCore | null;
    modifiedNodeIds?: Map<Id, Id>;
    pageLength?: number;
    disabledMultiSelect: boolean;
}
export type IStoreStateKey = keyof IStoreState;

export interface IServices {
    editorService: EditorService;
    uiService: UiService
}

export interface IUiState {
    /** 当前点击画布是否触发选中，true: 不触发，false: 触发，默认为false */
    uiSelectMode: boolean;
    /** 是否显示源码编辑器， true: 显示， false: 不显示，默认为false */
    showSrc: boolean;
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
}

export interface IBoxOptions {
    runtimeUrl?: string;
    autoScrollIntoView?: boolean;
    containerHighlightClassName?: string;
    containerHighlightDuration?: number;
    containerHighlightType?: IContainerHighlightType;
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
export enum ILayout {
    FLEX = 'flex',
    FIXED = 'fixed',
    RELATIVE = 'relative',
    ABSOLUTE = 'absolute',
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
    data: ISchemasPage;
    modifiedNodeIds: Map<Id, Id>;
    nodeField: Id;
}

export interface IHistoryState {
    pageField?: Id;
    pageSteps: Record<Id, UndoRedo<StepValue>>;
    canRedo: boolean;
    canUndo: boolean;
}
