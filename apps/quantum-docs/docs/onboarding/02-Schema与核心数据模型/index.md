# 02-Schema与核心数据模型

## Schema 为什么是项目核心

项目里真正长期存在、可持久化、可序列化的对象，不是 Vue 组件实例，也不是 DOM，而是 `ISchemasRoot`。

在 `packages/schemas/src/type.ts` 中，核心结构大致是：

```ts
ISchemasRoot
  -> children: ISchemasPage[]
ISchemasPage
  -> children: (ISchemasNode | ISchemasContainer)[]
ISchemasContainer
  -> children: (ISchemasNode | ISchemasContainer)[]
ISchemasNode
  -> component / componentProps / style / ifShow / created / mounted
```

这意味着整个页面系统其实是一棵配置树。

## 这棵树里每一层的职责

### `ISchemasRoot`

负责全局信息：

- 应用名
- 页面列表
- 数据源列表 `dataSources`
- 设计稿宽度 `designWidth`

### `ISchemasPage`

代表一个页面节点，本质是一个特殊容器。

### `ISchemasContainer`

代表能承载子节点的容器，例如 `Container`、`Page`。

### `ISchemasNode`

代表最终可渲染的叶子节点或普通节点，常见字段有：

- `field`
  - 节点唯一 id
- `component`
  - 运行时组件名
- `componentProps`
  - 传递给组件的 props
- `style`
  - 设计稿坐标系下的样式
- `ifShow`
  - 显示条件
- `created / mounted`
  - 生命周期钩子

## Core 如何把静态 Schema 变成可执行对象

`packages/core` 里有 3 个核心类：

### `LowCodeRoot`

它是全局入口，负责：

- 保存 `schemasRoot`
- 维护当前页面 `page`
- 注册全局组件
- 注册全局事件
- 创建 `DataSourceManager`
- 页面切换

### `LowCodePage`

它继承自 `LowCodeNode`，但额外维护：

- `nodes: Map<Id, LowCodeNode>`

这个 Map 很关键，因为 runtime 组件挂载时需要根据 `field` 反查节点实例。

### `LowCodeNode`

这是最重要的类，职责有 4 个：

1. 编译数据表达式
2. 编译显示条件
3. 包装事件
4. 管理生命周期

## `LowCodeNode` 的三次“转义”

### 1. 模板表达式转义

如果某个值是 `${user.name}`，`compileNode` 会：

- 识别它引用了哪个数据源字段
- 向 `DataSourceManager.track` 记录依赖
- 用当前数据把它编译成最终值

所以 Schema 里存的是“表达式”，运行时节点里拿到的是“执行后的值”。

#### 模板表达式的实际格式

当前源码里模板表达式使用 lodash `template` 执行，推荐格式是：

```text
${dataSourceId.fieldName}
${dataSourceId.objectField.childField}
```

其中：

- `dataSourceId`
  - 对应 `root.dataSources[].id`
- `fieldName`
  - 对应数据源字段配置里的 `fields[].name`
- 后续路径
  - 支持对象继续下钻，例如 `user.profile.nickName`

示例数据源：

```ts
const root = {
  type: 'root',
  field: 'root',
  name: 'demo',
  dataSources: [
    {
      type: 'base',
      id: 'user',
      title: '用户数据',
      fields: [
        {
          name: 'name',
          type: 'string',
          defaultValue: '张三'
        },
        {
          name: 'profile',
          type: 'object',
          fields: [
            {
              name: 'nickName',
              type: 'string',
              defaultValue: '小张'
            }
          ]
        }
      ],
      methods: []
    }
  ],
  children: []
}
```

在节点里绑定：

```ts
const node = {
  type: 'node',
  field: 'Text_userName',
  component: 'Text',
  componentProps: {
    text: '${user.name}',
    subText: '昵称：${user.profile.nickName}'
  }
}
```

运行时编译后，组件拿到的大致是：

```ts
{
  componentProps: {
    text: '张三',
    subText: '昵称：小张'
  }
}
```

#### 依赖是怎么记录的

`LowCodeNode.compileNode` 会把 `${user.profile.nickName}` 解析成：

```text
sourceId = user
fieldId = profile
```

然后记录依赖：

```ts
{
  field: 当前节点 field,
  rawValue: '${user.profile.nickName}',
  key: 'componentProps.subText',
  type: 'data'
}
```

这里有一个源码层面的细节：当前依赖触发的第一层字段是 `profile`，不是完整路径 `profile.nickName`。因此如果调用 `setData(data, 'profile.nickName')`，当前 `createDataSourceManager` 会取 path 第一段 `profile` 来触发依赖。

#### 可以绑定在哪些位置

只要值是字符串，并且会被 `compiledNode` 遍历到，就可以写模板表达式。常见位置包括：

- `componentProps.text`
- `componentProps.src`
- `componentProps.options`
- `label`
- 其他字符串型配置字段

例如：

```ts
{
  type: 'node',
  field: 'Img_avatar',
  component: 'Img',
  componentProps: {
    src: '${user.avatarUrl}'
  },
  label: '用户头像：${user.name}'
}
```

#### 使用时要注意

- 模板表达式依赖的是 `dataSourceManager.data`，不是原始 `dataSources` 配置。
- 数据源字段配置用的是 `name`，不是部分旧文档里写的 `field`。
- 当前实现用正则识别 `${...}`，建议一个字符串里正常写模板，不要写非常复杂的 JS 表达式。
- 编译后如果结果是字符串 `'true'` 或 `'false'`，会经过 `stringToBoolean` 转成布尔值。

### 2. 条件显示转义

`ifShow` 支持条件数组。`compileCond` 会：

- 找到条件依赖的数据源字段
- 注册为 `cond` 类型依赖
- 计算 `showResult`

运行时组件最终依据的是 `showResult` 和 `ifShow` 的组合结果。

#### `ifShow` 的实际格式

当前源码中 `ifShow` 的推荐格式是条件数组：

```ts
ifShow: [
  {
    field: ['dataSourceId', 'fieldName'],
    op: '>',
    value: 100,
    range: []
  }
]
```

字段含义：

- `field`
  - 数据源字段路径数组
  - 第 1 项是数据源 id
  - 后续项是字段路径
- `op`
  - 比较操作符
- `value`
  - 比较值
- `range`
  - 范围比较时使用，例如 `[10, 20]`

示例：

```ts
{
  type: 'node',
  field: 'VipText',
  component: 'Text',
  componentProps: {
    text: 'VIP 专属内容'
  },
  ifShow: [
    {
      field: ['user', 'level'],
      op: '>=',
      value: 3,
      range: []
    }
  ]
}
```

含义是：当 `dataSourceManager.data.user.level >= 3` 时显示该组件。

#### 嵌套字段格式

如果数据源数据是：

```ts
{
  user: {
    profile: {
      age: 18
    }
  }
}
```

则 `ifShow.field` 写成：

```ts
field: ['user', 'profile', 'age']
```

`compliedConditions` 内部会把后续字段拼成 `profile.age`，再通过 `js_utils_find_attr` 从数据源里取值。

#### 多条件之间的关系

当前 `compliedConditions` 是“全部满足才显示”，等价于 `AND`：

```ts
ifShow: [
  {
    field: ['user', 'level'],
    op: '>=',
    value: 3,
    range: []
  },
  {
    field: ['user', 'status'],
    op: '=',
    value: 'active',
    range: []
  }
]
```

含义是：

```text
user.level >= 3 && user.status === 'active'
```

当前没有内置 `OR` 分组语法。如果需要复杂逻辑，建议先在数据源方法里计算出一个布尔字段，再让 `ifShow` 判断这个布尔字段。

#### 当前运行时实际支持的操作符

以 `packages/utils/src/index.ts` 里的 `compliedCondition` 为准，当前执行逻辑支持：

| 操作符 | 含义 | 示例 |
| --- | --- | --- |
| `is` | 全等 | `fieldValue === value` |
| `=` | 全等 | `fieldValue === value` |
| `not` | 不全等 | `fieldValue !== value` |
| `!=` | 不全等 | `fieldValue !== value` |
| `>` | 大于 | `fieldValue > value` |
| `>=` | 大于等于 | `fieldValue >= value` |
| `<` | 小于 | `fieldValue < value` |
| `<=` | 小于等于 | `fieldValue <= value` |
| `between` | 在范围内 | `range[0] <= fieldValue <= range[1]` |
| `not_between` | 不在范围内 | `fieldValue < range[0] || fieldValue > range[1]` |
| `include` | 包含 | `fieldValue.includes(value)` |
| `not_include` | 不包含 | `!fieldValue.includes(value)` |

注意：`packages/schemas/src/type.ts` 里的类型声明包含 `in`、`not in`、`not between`，但当前比较函数实际实现的是 `include`、`not_include`、`not_between`。新人写业务 Schema 时，优先按运行时实现和编辑器表单产出的值来写。

#### `ifShow` 完整示例

```ts
const root = {
  type: 'root',
  field: 'root',
  name: 'demo',
  dataSources: [
    {
      type: 'base',
      id: 'user',
      title: '用户数据',
      fields: [
        {
          name: 'level',
          type: 'number',
          defaultValue: 3
        },
        {
          name: 'tags',
          type: 'array',
          defaultValue: ['vip', 'paid']
        }
      ],
      methods: []
    }
  ],
  children: [
    {
      type: 'page',
      field: 'page_home',
      children: [
        {
          type: 'node',
          field: 'Text_vip',
          component: 'Text',
          componentProps: {
            text: 'VIP 用户可见'
          },
          ifShow: [
            {
              field: ['user', 'level'],
              op: '>=',
              value: 3,
              range: []
            },
            {
              field: ['user', 'tags'],
              op: 'include',
              value: 'vip',
              range: []
            }
          ]
        }
      ]
    }
  ]
}
```

这个节点显示的条件是：

```text
user.level >= 3 && user.tags.includes('vip')
```

#### runtime 最终怎么判断显示

`packages/ui/src/q-component/src/component.vue` 中的显示逻辑可以理解为：

```ts
if (app.platform === 'editor') return true
if (config.showResult === false) return false
if (typeof config.ifShow === 'function') return config.ifShow(app)
if (config.ifShow) return config.ifShow
return true
```

也就是说：

- 编辑态 `platform === 'editor'` 时会强制显示，方便编辑隐藏组件。
- 条件数组会先由 `compileCond` 计算成 `showResult`。
- 如果 `showResult === false`，runtime 不渲染。
- 如果 `ifShow` 是函数，则运行时直接执行函数。

#### 使用时要注意

- 条件数组是全量 AND，没有 OR。
- `field` 第一项必须是数据源 id。
- `field` 至少要有两项，否则源码会判定条件不成立。
- `range` 只对 `between` 和 `not_between` 有意义。
- 如果数据源不存在或字段取不到，条件会返回 `false`。

### 3. 事件配置转义

`componentProps.onClick` 既可以是函数，也可以是配置数组。

`setEvents` 会把配置式事件转成真正的函数，再在触发时统一走 `root.emit(...)`。

这一步的意义是：编辑器可以只产出配置，不需要真的把用户代码塞进组件模板里。

## 生命周期是怎么接上的

`packages/ui/src/hooks/use-app.ts` 是关键桥：

- 组件创建前，调用节点的 `created`
- Vue `onMounted` 时，调用节点的 `mounted`
- Vue `onUnmounted` 时，调用节点的 `destroy`

这样 runtime 组件实例和 `LowCodeNode` 生命周期就被连起来了。

## 为什么 `field` 这么重要

在这个项目里，`field` 不只是主键，它还承担了 3 个角色：

1. 节点唯一标识
2. DOM `id`
3. 事件命名空间前缀

例如组件事件会被包装成：

```text
${node.field}:${eventName}
```

所以如果 `field` 管理混乱，选中、高亮、事件和节点查找都会一起出问题。

## 样式不是直接存浏览器像素

项目默认以设计稿宽度为基准存样式值，在 `packages/core/src/utils.ts` 中通过 `defaultTransformStyle` 转成 runtime 要用的 `rem`。

这带来两个后果：

- Schema 存的是设计尺寸，不是当前 iframe 实际像素
- 编辑器里的拖拽坐标和 runtime 渲染坐标之间一定有换算

这也是后面 `Sandbox` 里大量坐标换算逻辑存在的原因。

## 新人阅读这一层时的正确心智

不要把 `LowCodeNode` 看成“配置对象包装器”，要把它看成“页面节点执行单元”。

它不仅存数据，还负责：

- 依赖注册
- 生命周期执行
- 事件转发
- 条件编译

这就是为什么 `Core` 是整个项目的执行内核。
