export default [{
    field: 'field',
    label: '页面id',
    component: 'Input',
}, {
    field: 'title',
    label: '页面标题',
    component: 'Input',
}, {
    field: 'layout',
    label: '容器布局',
    component: 'Select',
    componentProps: {
        options: [
            { label: '绝对定位', value: 'absolute', },
            { label: '流式布局', value: 'relative', }
        ],
    },
}];
