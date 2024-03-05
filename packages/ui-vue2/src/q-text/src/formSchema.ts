export default [{
    field: 'isNative',
    label: '富文本格式',
    component: 'Switch',
}, {
    field: 'text',
    label: '文本',
    component: 'Input',
    ifShow: ({values, }) => !values['componentProps.isNative'],
}, {
    field: 'multiple',
    label: '多行文本',
    component: 'Switch',
    ifShow: ({values, }) => !values['componentProps.isNative'],
}, {
    field: 'text',
    label: '富文本',
    component: 'RichText',
    ifShow: ({values, }) => values['componentProps.isNative'],
}];
