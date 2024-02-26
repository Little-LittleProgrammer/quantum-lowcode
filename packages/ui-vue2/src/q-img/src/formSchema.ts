export default [{
    field: 'src',
    label: '图片链接',
    component: 'Input',
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
