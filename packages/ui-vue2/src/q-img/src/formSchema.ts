export default [{
    field: 'imgType',
    label: '图片格式',
    component: 'Select',
    defaultValue: '1',
    componentProps: {
        options: [{
            label: '已有链接',
            value: '1',
        }, {
            label: '上传图片',
            value: '2',
        }],
    },
}, {
    field: 'src',
    label: '图片链接',
    component: 'Input',
    defaultValue: '这是一个图片',
    ifShow: ({values, }) => values['componentProps.imgType'] === '1',
}, {
    field: 'src',
    label: '图片',
    component: 'CardUpload',
    ifShow: ({values, }) => values['componentProps.imgType'] === '2',
}, {
    // 此组件支持的事件, 需要在组件中emit出来,目的为配置化界面配置事件时可以选择一下事件
    field: 'events',
    label: '事件',
    component: 'EventSelect', // 事件必须填这个组件
    componentProps: {
        options: [{
            label: '点击',
            value: 'onClick',
        }],
    },
}];
