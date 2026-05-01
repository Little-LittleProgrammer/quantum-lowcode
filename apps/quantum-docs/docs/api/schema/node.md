# 普通节点

普通节点对应一个具体运行时组件。运行时会根据节点的 `component` 字段从 `LowCodeRoot.components` 中解析组件，并把编译后的 `componentProps`、`style`、`config` 等信息传给组件。

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `'node'` 或自定义类型 | 是 | 普通节点类型 |
| `field` | `string` | 是 | 节点唯一标识 |
| `component` | `string` | 是 | 组件注册名 |
| `componentProps` | `Record<string, any>` | 否 | 组件属性 |
| `style` | `Record<string, any>` | 否 | 节点样式 |
| `label` | `string` | 否 | 展示名称或表单标签 |
| `ifShow` | `boolean \| IfShow[] \| Function` | 否 | 条件显示 |
| `created` | `Hooks` | 否 | 创建阶段动作 |
| `mounted` | `Hooks` | 否 | 挂载阶段动作 |

## 示例

```ts
{
  type: 'node',
  field: 'submitButton',
  component: 'Button',
  label: '提交按钮',
  style: {
    width: '120px'
  },
  componentProps: {
    text: '提交',
    type: 'primary',
    onClick: ({ app }) => {
      app.emit('form:submit');
    }
  }
}
```

## 数据绑定

普通节点可以在属性中使用数据源表达式：

```ts
{
  componentProps: {
    text: '${user.name}',
    disabled: '${form.submitting}'
  }
}
```

编译节点时会把表达式解析成当前数据，并记录依赖。后续数据源更新时，依赖该字段的节点会被重新计算。

## 条件显示

```ts
{
  ifShow: [
    {
      field: ['user', 'isLogin'],
      op: '=',
      value: true
    }
  ]
}
```

也可以写函数：

```ts
{
  ifShow: ({ values }) => values.user?.isLogin
}
```

## 编写建议

- `component` 使用稳定的注册名，不要直接写文件路径。
- `field` 不要和同页其他节点重复，否则页面节点表和编辑器选中逻辑会互相覆盖。
- 组件交互建议通过 `app.emit('数据源ID:方法名')` 调用全局方法，减少组件对业务实现的耦合。
