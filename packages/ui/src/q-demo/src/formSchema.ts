export default [{
    field: 'api',
    label: '请求接口',
    component: 'InputSelect',
}, {
    // 此组件支持的事件, 需要在组件中emit出来,目的为配置化界面配置事件时可以选择一下事件
    field: 'events',
    label: '事件',
    component: 'EventSelect', // 事件必须填这个组件
    componentProps: {
        options: [{
            label: '点击',
            value: 'onClick',
        }, {
            label: 'change',
            value: 'onChange',
        }],
    },
}]; 
