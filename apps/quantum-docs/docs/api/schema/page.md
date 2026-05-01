# 页面节点

页面节点是根节点 `children` 下的一级节点。`LowCodeRoot.setPage(field)` 会根据页面 `field` 创建 `LowCodePage` 实例，并把页面内所有节点注册到页面节点表中。

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `'page'` | 是 | 页面节点类型 |
| `field` | `string` | 是 | 页面唯一标识，也是切换页面时使用的 id |
| `style` | `Record<string, any>` | 否 | 页面根容器样式 |
| `children` | `(ISchemasNode \| ISchemasContainer)[]` | 是 | 页面下的节点列表 |
| `label` | `string` | 否 | 编辑器展示名 |

## 示例

```ts
{
  type: 'page',
  field: 'home',
  label: '首页',
  style: {
    width: '100%',
    minHeight: '100%',
    margin: '0 auto'
  },
  children: [
    {
      type: 'container',
      field: 'main',
      children: []
    }
  ]
}
```

## 页面切换

页面切换由 App 实例完成：

```ts
app.setPage('home');
```

切换时会销毁旧页面实例，创建新的 `LowCodePage`，并派发 `page-change` 事件。

## 编写建议

- 页面 `field` 保持稳定，避免影响页面切换、历史记录和编辑器默认选中逻辑。
- 页面下可以直接放普通节点，但复杂页面建议先放容器节点，让布局关系更清晰。
- 页面样式一般只放尺寸、背景和页面级布局，不建议在页面节点上堆叠业务组件样式。
