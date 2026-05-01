# 容器节点

容器节点用于承载子节点。编辑器拖拽、层级树、运行时递归渲染都依赖容器的 `children` 字段。

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `'container'` 或自定义容器类型 | 是 | 容器类型 |
| `field` | `string` | 是 | 容器唯一标识 |
| `component` | `string` | 否 | 容器对应的运行时组件名，默认容器通常使用 `container` |
| `componentProps` | `Record<string, any>` | 否 | 传给容器组件的属性 |
| `style` | `Record<string, any>` | 否 | 容器样式 |
| `children` | `(ISchemasNode \| ISchemasContainer)[]` | 是 | 子节点列表 |
| `ifShow` | `boolean \| IfShow[] \| Function` | 否 | 是否显示 |

## 示例

```ts
{
  type: 'container',
  field: 'hero',
  component: 'container',
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px'
  },
  children: [
    {
      type: 'node',
      field: 'title',
      component: 'Text',
      componentProps: {
        text: '标题'
      }
    }
  ]
}
```

## 编辑器识别

编辑器通过 `isContainer` 判断画布上的 DOM 是否可以接收拖入节点。默认实现会检查 DOM 是否包含 `quantum-ui-container` class。

```ts
isContainer: (el) => el.classList.contains('quantum-ui-container')
```

如果业务方提供自定义容器组件，需要确保运行时 DOM 能被 `isContainer` 识别，或在编辑器 props 中覆盖该判断函数。

## 编写建议

- 容器应显式提供 `children`，即使初始为空也写成 `[]`。
- 拖拽定位相关样式优先放在容器上，例如 `position`、`display`、`gap`。
- 嵌套容器时保持层级有业务含义，避免为了样式创建过深的无意义层级。
