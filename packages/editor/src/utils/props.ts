import { FormSchema } from '@q-front-npm/vue3-antd-pc-ui';
import { parseSchemas } from '@qimao/quantum-utils';

const styleSchemas:FormSchema<any, 'CodeEditor'>[] = [
    {
        label: '布局',
        field: 'type',
        component: 'Input',
        ifShow: false,
    },
    {
        label: '布局',
        field: 'position',
        component: 'Divider',
        ifShow: ({values, }) => values['type'] === 'page' || values['type'] === 'container',
    },
    {
        field: 'layout',
        label: '容器布局',
        component: 'Select',
        ifShow: ({values, }) => {
            return values['type'] === 'page' || values['type'] === 'container';
        },
        componentProps: ({formModel, }) => ({
            options: [
                { label: '绝对定位', value: 'absolute', },
                { label: '流式布局', value: 'relative', }
            ],
        }),
    },
    {
        label: '自定义样式',
        field: 'customStyleSwitch',
        component: 'Switch',
        helpMessage: '需熟悉css'
    },
    // TODO 优化样式功能
    // 目前问题: 1. 样式覆盖, 无法更改输入框配置样式了; 2. 编辑器失焦报错; 3. 卡顿问题
    {
        label: 'css编辑器',
        field: 'style',
        component: 'CodeEditor',
        helpMessage: ['对于需要转为rem的属性请直接填写数字', '对于输入框配置的属性无法更改', 'command+s保存'],
        componentProps: {
            style: {
                height: '700px' 
            },
            parse: parseSchemas
        },
        ifShow: ({values, }) => {
            return values['customStyleSwitch'];
        }
    },
    {
        label: '位置',
        field: 'position',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: 'top',
        field: 'style.top',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: 'left',
        field: 'style.left',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: 'right',
        field: 'style.right',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: 'bottom',
        field: 'style.bottom',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '盒子',
        field: 'box',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '宽度',
        field: 'style.width',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '高度',
        field: 'style.height',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '边框',
        field: 'box',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '宽度',
        field: 'style.borderWidth',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '颜色',
        field: 'style.borderColor',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '样式',
        field: 'style.borderStyle',
        component: 'Select',
        defaultValue: 'none',
        componentProps: {
            options: [{ label: 'none', value: 'none', },
                { label: 'hidden', value: 'hidden', },
                { label: 'dotted', value: 'dotted', },
                { label: 'dashed', value: 'dashed', },
                { label: 'solid', value: 'solid', },
                { label: 'double', value: 'double', },
                { label: 'groove', value: 'groove', },
                { label: 'ridge', value: 'ridge', },
                { label: 'inset', value: 'inset', },
                { label: 'outset', value: 'outset', } ],
        },
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '圆角',
        field: 'style.borderRadius',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '背景',
        field: 'background',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '链接',
        field: 'style.backgroundImage',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '颜色',
        field: 'style.backgroundColor',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '重复',
        field: 'style.backgroundRepeat',
        component: 'Select',
        defaultValue: 'no-repeat',
        componentProps: {
            options: [
                { label: 'repeat', value: 'repeat', },
                { label: 'repeat-x', value: 'repeat-x', },
                { label: 'repeat-y', value: 'repeat-y', },
                { label: 'no-repeat', value: 'no-repeat', },
                { label: 'inherit', value: 'inherit', }
            ],
        },
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '背景图大小',
        field: 'style.backgroundSize',
        component: 'Input',
        defaultValue: '100% 100%',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '字体',
        field: 'font',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '颜色',
        field: 'style.color',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '大小',
        field: 'style.fontSize',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '行高',
        field: 'style.lineHeight',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '粗细',
        field: 'style.fontWidth',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '对齐',
        field: 'style.textAlign',
        component: 'Select',
        defaultValue: 'left',
        componentProps: {
            options: [
                { label: 'center', value: 'center', },
                { label: 'left', value: 'left', },
                { label: 'right', value: 'right', }
            ],
        },
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '变形',
        field: 'transform',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '旋转角度',
        field: 'style.transform.rotate',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }, {
        label: '缩放',
        field: 'style.transform.scale',
        component: 'Input',
        ifShow: ({values, }) => {
            return !values['customStyleSwitch'];
        }
    }];
const lifeHookschemas:FormSchema[] = [];
const ifShowSchemas:FormSchema[] = [];

export const otherConfigMap:Record<string, any> = {
    style: styleSchemas,
    lifeHooks: lifeHookschemas,
    ifShow: ifShowSchemas,
    methods: {},
};

export function formatConfig(config: FormSchema[]): any {
    const defaultConf:FormSchema[] = [{
        label: '组件id',
        component: 'Text',
        field: 'field',
    }, {
        label: '组件名称',
        component: 'Input',
        field: 'label',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
    }];

    config = config.map((item) => {
        item.field = `componentProps.${item.field}`;
        if (item.component === 'Input') {
            item.helpMessage = item.helpMessage ? item.helpMessage + '; 填写${dataSourceId:fieldId} 可获取全局参数' : '填写${dataSourceId:fieldId} 可获取全局参数';
        }
        return item;
    });

    return [
        ...defaultConf,
        ...config
    ];
}
