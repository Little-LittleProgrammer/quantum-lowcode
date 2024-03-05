import { FormSchema } from '@q-front-npm/vue3-antd-pc-ui';

const styleSchemas:FormSchema[] = [
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
        label: '位置',
        field: 'position',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
    }, {
        label: 'top',
        field: 'style.top',
        component: 'Input',
    }, {
        label: 'left',
        field: 'style.left',
        component: 'Input',
    }, {
        label: 'right',
        field: 'style.right',
        component: 'Input',
    }, {
        label: 'bottom',
        field: 'style.bottom',
        component: 'Input',
    }, {
        label: '盒子',
        field: 'box',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
    }, {
        label: '宽度',
        field: 'style.width',
        component: 'Input',
    }, {
        label: '高度',
        field: 'style.height',
        component: 'Input',
    }, {
        label: '边框',
        field: 'box',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
    }, {
        label: '宽度',
        field: 'style.borderWidth',
        component: 'Input',
    }, {
        label: '颜色',
        field: 'style.borderColor',
        component: 'Input',
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
    }, {
        label: '圆角',
        field: 'style.borderRadius',
        component: 'Input',
    }, {
        label: '背景',
        field: 'background',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
    }, {
        label: '链接',
        field: 'style.backgroundImage',
        component: 'Input',
    }, {
        label: '颜色',
        field: 'style.backgroundColor',
        component: 'Input',
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
    }, {
        label: '背景图大小',
        field: 'style.backgroundSize',
        component: 'Input',
        defaultValue: '100% 100%',
    }, {
        label: '字体',
        field: 'font',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
    }, {
        label: '颜色',
        field: 'style.color',
        component: 'Input',
    }, {
        label: '大小',
        field: 'style.fontSize',
        component: 'Input',
    }, {
        label: '行高',
        field: 'style.lineHeight',
        component: 'Input',
    }, {
        label: '粗细',
        field: 'style.fontSize',
        component: 'Input',
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
    }, {
        label: '变形',
        field: 'transform',
        component: 'Divider',
        helpMessage: '填写${dataSourceId:fieldId} 可获取全局参数',
    }, {
        label: '旋转角度',
        field: 'style.transform.rotate',
        component: 'Input',
    }, {
        label: '缩放',
        field: 'style.transform.scale',
        component: 'Input',
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
