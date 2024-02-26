import { FormSchema } from '@q-front-npm/vue3-antd-pc-ui';

const styleSchemas:FormSchema[] = [{
    label: '位置',
    field: 'position',
    component: 'Divider',
}, {
    label: 'top',
    field: 'style.top',
    component: 'InputNumber',
}, {
    label: 'left',
    field: 'style.left',
    component: 'InputNumber',
}, {
    label: 'right',
    field: 'style.right',
    component: 'InputNumber',
}, {
    label: 'bottom',
    field: 'style.bottom',
    component: 'InputNumber',
}, {
    label: '盒子',
    field: 'box',
    component: 'Divider',
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
}, {
    label: '旋转角度',
    field: 'style.rotate',
    component: 'Input',
}, {
    label: '缩放',
    field: 'style.scale',
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
    }];

    config = config.map((item) => {
        item.field = `componentProps.${item.field}`;
        return item;
    });

    return [
        ...defaultConf,
        ...config
    ];
}
