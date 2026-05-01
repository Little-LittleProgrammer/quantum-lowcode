# 低代码 Schema 协议

Schema 是 Quantum 的核心数据结构。编辑器保存 Schema，运行时读取 Schema，Core 将 Schema 转成 `LowCodeRoot`、`LowCodePage`、`LowCodeNode` 实例后完成页面渲染、事件绑定和数据源依赖收集。

## 树结构

一份完整 Schema 必须从根节点开始：

```text
root
└── page
    ├── container
    │   ├── node
    │   └── container
    │       └── node
    └── node
```

节点类型由 `NodeType` 约定：

| 类型 | 值 | 说明 |
| --- | --- | --- |
| 根节点 | `root` | 应用级配置，只能有一个 |
| 页面节点 | `page` | 一个可切换的页面 |
| 容器节点 | `container` | 可承载子节点的布局节点 |
| 普通节点 | `node` | 具体组件节点 |

## 根节点字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `'root'` | 是 | 固定为根节点类型 |
| `field` | `string` | 是 | 根节点唯一标识，通常为 `root` |
| `name` | `string` | 是 | 应用名称，也会用于运行时页面标题 |
| `children` | `ISchemasPage[]` | 是 | 页面节点列表 |
| `description` | `IMetaDes` | 否 | 页面 meta 信息 |
| `dataSources` | `IDataSourceSchema[]` | 否 | 全局数据源和方法配置 |
| `designWidth` | `number` | 否 | 移动端设计稿宽度，用于样式转换 |

## 通用节点字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | 是 | 节点类型，推荐使用 `root`、`page`、`container`、`node` |
| `field` | `string` | 是 | 节点唯一标识，也是编辑器、事件和依赖表定位节点的主键 |
| `component` | `string` | 普通节点必填 | 运行时组件名称，必须能通过 `LowCodeRoot.resolveComponent` 找到 |
| `componentProps` | `Record<string, any>` | 否 | 透传给组件的属性，可使用 `${dataSource.field}` 绑定数据 |
| `label` | `string` | 否 | 展示文案或表单标签，具体由组件解释 |
| `style` | `Partial<CSSStyleDeclaration>` | 否 | 内联样式，支持数字值 |
| `ifShow` | `boolean \| IfShow[] \| Function` | 否 | 条件显示配置 |
| `children` | `ISchemasNode[]` | 容器必填 | 子节点 |
| `created` | `Hooks` | 否 | 创建阶段钩子 |
| `mounted` | `Hooks` | 否 | 挂载阶段钩子 |

## 条件显示

`ifShow` 可以直接写布尔值，也可以写函数或条件数组。条件数组用于配置化表达式：

```ts
{
  field: ['base1', 'visible'],
  op: '=',
  value: true
}
```

常用操作符包括 `=`、`!=`、`>`、`>=`、`<`、`<=`、`in`、`not in`、`between`、`not between`。

## 生命周期钩子

钩子使用数据源方法或代码块能力触发动作：

```ts
{
  created: {
    hookType: 'code',
    hookData: [
      {
        field: 'base1:init',
        params: { from: 'created' }
      }
    ]
  }
}
```

`field` 一般写成 `数据源ID:方法名`。运行时会通过 `app.emit` 找到对应方法。

## 最小示例

```ts
import { NodeType } from '@quantum-lowcode/schemas';

export const schema = {
  type: NodeType.ROOT,
  field: 'root',
  name: 'demo',
  dataSources: [
    {
      type: 'base',
      id: 'base1',
      title: '基础数据',
      fields: [
        {
          name: 'title',
          type: 'string',
          defaultValue: 'Hello Quantum'
        }
      ],
      methods: []
    }
  ],
  children: [
    {
      type: NodeType.PAGE,
      field: 'home',
      style: {
        width: '100%',
        height: '100%'
      },
      children: [
        {
          type: NodeType.CONTAINER,
          field: 'main',
          style: {
            padding: '16px'
          },
          children: [
            {
              type: NodeType.NODE,
              field: 'title',
              component: 'Text',
              componentProps: {
                text: '${base1.title}'
              }
            },
            {
              type: NodeType.NODE,
              field: 'button',
              component: 'Button',
              componentProps: {
                text: '提交'
              }
            }
          ]
        }
      ]
    }
  ]
};
```

## 继续阅读

- [App 实例](./app.md)：了解 Schema 如何进入 `LowCodeRoot`。
- [页面节点](./page.md)：了解多页面和页面切换。
- [容器节点](./container.md)：了解节点嵌套和布局。
- [普通节点](./node.md)：了解组件节点字段。
- [全局数据](./datasource.md)：了解数据源、方法和数据绑定。
