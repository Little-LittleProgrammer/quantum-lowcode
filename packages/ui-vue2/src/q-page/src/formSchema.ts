export default [{
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
