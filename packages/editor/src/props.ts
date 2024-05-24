import { ISchemasNode, ISchemasRoot, Id } from '@quantum-lowcode/schemas';
import { IComponentGroup, IDatasourceTypeOption, IEditorNodeInfo, ISandboxRect } from './types';
import { CONTAINER_HIGHLIGHT_CLASS_NAME, CONTAINER_HIGHLIGHT_DELAY_TIME, ContainerHighlightType, ICustomizeMoveableOptionsCallbackConfig, IGuidesOptions, IUpdateDragEl, MoveableOptions } from '@quantum-lowcode/sandbox';
import type { DropMenu, FormSchema } from '@quantum-design/vue3-antd-pc-ui';

export interface IEditorProps {
    // root节点
    value?: ISchemasRoot;
    // 链接
    runtimeUrl?: string;
    boxRect?: ISandboxRect;
    codeOptions?: { [key: string]: any };
    /** 用于设置画布上的dom是否可以被选中 */
    canSelect?: (el: HTMLElement) => boolean | Promise<boolean>;
    /** 用于设置画布上的dom是否可以被拖入其中 */
    isContainer?: (el: HTMLElement) => boolean | Promise<boolean>;
    /** 选中时会在画布上复制出一个大小相同的dom，实际拖拽的是这个dom，此方法用于干预这个dom的生成方式 */
    updateDragEl?: IUpdateDragEl;
    /** 画布中组件选中框的移动范围 */
    moveableOptions?: MoveableOptions | ((config?: ICustomizeMoveableOptionsCallbackConfig) => MoveableOptions);
    /** 左侧面板中的组件类型列表 */
    componentGroupList?: IComponentGroup[];
    /** 拖入画布中容器时，识别到容器后给容器根dom加上的class */
    containerHighlightClassName?: string;
    /** 拖入画布中容器时，悬停识别容器的时间 */
    containerHighlightDuration?: number;
    /** 拖入画布中容器时，识别容器的操作类型 */
    containerHighlightType?: ContainerHighlightType;
    /** 选中时是否自动滚动到可视区域 */
    autoScrollIntoView?: boolean;
    /** 初始值 */
    propsValues?: Record<string, Partial<ISchemasNode>>;
    propsConfigs?: Record<string, FormSchema[]>;
    methodsList?: Record<string, any[]>;
    datasourceList?: IDatasourceTypeOption[]
    defaultSelected?: Id;
    boxContextmenuConfigs: Record<string, {
        dropDownList: DropMenu;
        extraDropEvent: (menu: DropMenu, nodeInfo:IEditorNodeInfo) => void;
    }>;
    /** 禁用鼠标左键按下时就开始拖拽，需要先选中再可以拖拽 */
    disabledDragStart?: boolean;
    /** 标尺配置 */
    guidesOptions?: Partial<IGuidesOptions>;
}

export const defaultEditorProps = {
    codeOptions: () => ({}),
    canSelect: (el: HTMLElement) => Boolean(el.id), // 带 id 代表这个组件是dsl配置的
    isContainer: (el: HTMLElement) => el.classList.contains('quantum-ui-container'),
    componentGroupList: [{
        text: '容器组件',
        children: [{
            'text': '容器',
            'component': 'container',
            icon: 'FolderOpenOutlined',
        },{
            'text': '蒙层',
            'component': 'OverlayContainer',
            icon: 'FolderOpenOutlined',
            data: {
                style: {
                    position: 'fixed',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                }, 
            }
        }],
		},{
        /** 显示文案 */
        text: '基本组件',
        /** 组内列表 */
        children: [{
            'text': '按钮',
            'component': 'Button',
            icon: 'SelectOutlined',
        }, {
            'text': '图片',
            'component': 'Img',
            icon: 'LinkOutlined',
        }, {
            'text': '视频',
            'component': 'Video',
            icon: 'PlayCircleOutlined',
        }, {
            'text': '文本',
            'component': 'Text',
            icon: 'LineOutlined',
        }, {
            'text': '二维码',
            'component': 'Button',
            icon: 'SelectOutlined',
        }],
    }],
    containerHighlightClassName: CONTAINER_HIGHLIGHT_CLASS_NAME,
    containerHighlightDuration: CONTAINER_HIGHLIGHT_DELAY_TIME,
    containerHighlightType: ContainerHighlightType.DEFAULT,
    autoScrollIntoView: true,
    propsValues: () => ({
        'page': {
            style: {
                height: '100%',
                margin: '0 auto'
            },
        },
        'container': {
            style: {
                height: '100',
            },
        },
    }),
    propsConfigs: () => {},
    methodsList: () => {},
    datasourceList: () => [],
};
