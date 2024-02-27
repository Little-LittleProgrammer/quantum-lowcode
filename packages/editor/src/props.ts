import { ISchemasNode, ISchemasRoot } from '@qimao/quantum-schemas';
import { IComponentGroup, ISandboxRect } from './types';
import { CONTAINER_HIGHLIGHT_CLASS_NAME, ContainerHighlightType, ICustomizeMoveableOptionsCallbackConfig, MoveableOptions } from '@qimao/quantum-sandbox';
import { FormSchema } from '@q-front-npm/vue3-antd-pc-ui';

export interface IEditorProps {
    // root节点
    value?: ISchemasRoot;
    // 链接
    runtimeUrl?: string;
    boxRect?: ISandboxRect;
    codeOptions?: { [key: string]: any };
    /** 用于设置画布上的dom是否可以被选中 */
    canSelect?: (el: HTMLElement) => boolean | Promise<boolean>;
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
    /** 初始值 */
    propsValues?: Record<string, Partial<ISchemasNode>>;
    propsConfigs?: Record<string, FormSchema[]>;
    methodsList?: Record<string, any[]>
}

export const defaultEditorProps = {
    codeOptions: () => ({}),
    canSelect: (el: HTMLElement) => Boolean(el.id), // 带 id 代表这个组件是dsl配置的
    componentGroupList: [{
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
            icon: 'SelectOutlined',
        }, {
            'text': '视频',
            'component': 'Video',
            icon: 'SelectOutlined',
        }, {
            'text': '文本',
            'component': 'Text',
            icon: 'SelectOutlined',
        }, {
            'text': '二维码',
            'component': 'Button',
            icon: 'SelectOutlined',
        }],
    }, {
        text: '定制组件',
        /** 组内列表 */
        children: [{
            'text': '按钮',
            'component': 'Button',
            icon: 'SelectOutlined',
        }, {
            'text': '图片',
            'component': 'Button',
            icon: 'SelectOutlined',
        }, {
            'text': '视频',
            'component': 'Button',
            icon: 'SelectOutlined',
        }, {
            'text': '文本',
            'component': 'Button',
            icon: 'SelectOutlined',
        }, {
            'text': '二维码',
            'component': 'Button',
            icon: 'SelectOutlined',
        }],
    }, {
        text: '自定义模版',
        /** 组内列表 */
        children: [{
            'text': '按钮',
            'component': 'Button',
            icon: 'SelectOutlined',
        }, {
            'text': '图片',
            'component': 'Button',
            icon: 'SelectOutlined',
        }, {
            'text': '视频',
            'component': 'Button',
            icon: 'SelectOutlined',
        }, {
            'text': '文本',
            'component': 'Button',
            icon: 'SelectOutlined',
        }, {
            'text': '二维码',
            'component': 'Button',
            icon: 'SelectOutlined',
        }],
    }],
    containerHighlightClassName: CONTAINER_HIGHLIGHT_CLASS_NAME,
    containerHighlightDuration: 800,
    containerHighlightType: ContainerHighlightType.DEFAULT,
    propsValues: () => ({
        'page': {
            style: {
                height: '100%',
                width: '100%',
            },
        },
        'container': {
            style: {
                height: '100',
                width: '375', },
        },
    }),
    propsConfigs: () => {},
    methodsList: () => {},
};
