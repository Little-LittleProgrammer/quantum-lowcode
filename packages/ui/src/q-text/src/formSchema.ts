export default [{
    field: 'isNative',
    label: '文本格式',
    component: 'Select',
    componentProps: {
        options: [{
            label: '普通文本',
            value: '1'
        }, {
            label: '富文本',
            value: '2'
        }]
    }
}, {
    field: 'text',
    label: '文本',
    component: 'InputSelect',
    ifShow: ({values }) => values['componentProps.isNative'] === '1'
}, {
    field: 'multiple',
    label: '多行文本',
    component: 'Switch',
    ifShow: ({values }) => values['componentProps.isNative'] === '1'
}, {
    field: 'text',
    label: '富文本',
    component: 'RichText',
    show: ({values }) => values['componentProps.isNative'] === '2',
    componentProps: {
        toolbar: [
            'fontsizeselect formatselect lineheight searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample',
            'hr bullist numlist link  preview anchor pagebreak insertdatetime media  forecolor backcolor fullscreen'
        ]
    },
    colProps: {
        span: 24
    }
}];
