# 全局数据与数据源

数据源定义在根 Schema 的 `dataSources` 字段中，用来管理全局数据、全局方法和 HTTP 请求。运行时会创建 `DataSourceManager`，并把数据源方法注册到 `app.emit` 可触发的事件系统里。

## 数据源结构

```ts
interface IDataSourceSchema {
  type: 'base' | 'http';
  id: string;
  title?: string;
  description?: string;
  fields: IDataSchema[];
  methods: ICodeBlockContent[];
  mocks?: IMockSchema;
  options?: IHttpOptions;
}
```

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `type` | `'base' \| 'http'` | 是 | 数据源类型 |
| `id` | `string` | 是 | 数据源唯一标识，数据绑定和事件调用都依赖它 |
| `title` | `string` | 否 | 展示名称 |
| `description` | `string` | 否 | 说明文案 |
| `fields` | `IDataSchema[]` | 是 | 数据字段定义 |
| `methods` | `ICodeBlockContent[]` | 是 | 方法定义 |
| `mocks` | `IMockSchema` | 否 | mock 数据 |
| `options` | `IHttpOptions` | HTTP 常用 | HTTP 请求配置 |

## 字段定义

```ts
interface IDataSchema {
  name: string;
  type?: 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string' | 'any';
  title?: string;
  description?: string;
  defaultValue?: any;
  fields?: IDataSchema[];
}
```

字段的 `name` 会参与模板表达式，例如 `${user.name}`。

## Base 数据源

`base` 适合放全局状态和本地方法。

```ts
{
  type: 'base',
  id: 'user',
  title: '用户数据',
  fields: [
    {
      name: 'name',
      type: 'string',
      defaultValue: 'Quantum'
    }
  ],
  methods: [
    {
      name: 'setName',
      params: [{ name: 'name', type: 'string' }],
      content: ({ dataSource }, name) => {
        dataSource.setData({ name });
      }
    }
  ]
}
```

调用方式：

```ts
app.emit('user:setName', 'New Name');
```

绑定方式：

```ts
{
  component: 'Text',
  field: 'userName',
  componentProps: {
    text: '${user.name}'
  }
}
```

## HTTP 数据源

`http` 适合封装接口请求。请求函数来自 `LowCodeRoot` 的 `request` 参数。初始化 HTTP 数据源时，内部会注册 `http:数据源ID` 事件来触发请求。

```ts
{
  type: 'http',
  id: 'postList',
  title: '文章列表',
  fields: [
    {
      name: 'list',
      type: 'array',
      defaultValue: []
    }
  ],
  options: {
    url: '/api/posts',
    method: 'GET',
    params: {
      page: '1'
    }
  },
  methods: [
    {
      name: 'afterInit',
      timing: 'afterInit',
      params: [],
      content: ({ app }) => app.emit('http:postList')
    }
  ],
  mocks: {
    title: '文章 mock',
    data: {
      list: []
    }
  }
}
```

## 依赖更新

当组件属性使用 `${source.field}` 语法时，运行时会记录依赖关系。数据源更新后，`DataSourceManager` 会找到依赖该字段的节点并触发视图更新。

```ts
{
  component: 'Text',
  field: 'titleText',
  componentProps: {
    text: '${postList.list}'
  }
}
```

依赖记录包含：

| 字段 | 说明 |
| --- | --- |
| `field` | 依赖该数据的节点 field |
| `key` | 节点内被绑定的路径，例如 `componentProps.text` |
| `rawValue` | 原始表达式，例如 `${postList.list}` |
| `type` | `data` 或 `cond` |

## Manager API

`app.dataSourceManager` 暴露了几个常用方法：

| 方法 | 说明 |
| --- | --- |
| `get(id)` | 获取指定数据源实例 |
| `track(sourceId, fieldId, data)` | 记录某个字段的依赖 |
| `trigger(sourceId?, fieldId?)` | 触发依赖更新，不传参数时触发全部数据源 |
| `updateSchema(schemas)` | 按新的数据源 Schema 重建已有数据源 |
| `removeDataSource(id)` | 删除数据源实例 |

数据源实例本身可以用 `setData(data, path?)` 更新数据。传入 `path` 时会只更新指定路径，并触发 `change` 事件。

## 使用建议

- 数据源 `id` 保持稳定，不要使用会随环境变化的值。
- 组件展示数据优先通过 `${source.field}` 绑定，避免在组件内部直接读全局实例。
- HTTP 数据源统一走 `request`，便于业务方接入鉴权、错误处理和埋点。
- 方法名建议使用动词，例如 `refresh`、`submit`、`setName`。
