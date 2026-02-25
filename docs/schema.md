# Schema 协议详解

本文档详细介绍 Quantum Lowcode 的 JSON Schema 配置协议。

## 概述

Quantum Lowcode 使用标准化的 JSON Schema 来描述页面配置。每个配置都是一个树形结构，包含页面、容器和组件节点。

## 基础结构

```typescript
interface ISchemasRoot {
  /** 根节点类型 */
  type: 'root';
  /** 子页面列表 */
  children: ISchemasPage[];
  /** 数据源配置 */
  dataSources?: IDataSourceSchema[];
  /** 设计宽度 */
  designWidth?: number;
  /** 页面最大宽度 */
  pageMaxWidth?: number;
}

interface ISchemasPage {
  /** 页面类型 */
  type: 'page';
  /** 唯一标识 */
  field: string;
  /** 页面名称 */
  label?: string;
  /** 页面配置 */
  pageStyles?: Record<string, any>;
  /** 子节点 */
  children: (ISchemasNode | ISchemasContainer)[];
}

interface ISchemasContainer {
  /** 容器类型 */
  type: 'container';
  /** 唯一标识 */
  field: string;
  /** 容器名称 */
  label?: string;
  /** 容器样式 */
  style?: Record<string, any>;
  /** 容器属性 */
  componentProps?: Record<string, any>;
  /** 条件显示 */
  ifShow?: IfShow;
  /** 子节点 */
  children: ISchemasNode[];
}

interface ISchemasNode {
  /** 组件类型 */
  type: 'node';
  /** 唯一标识 */
  field: string;
  /** 组件名称 */
  label?: string;
  /** 组件类型 */
  component: string;
  /** 组件属性 */
  componentProps?: Record<string, any>;
  /** 样式配置 */
  style?: Record<string, any>;
  /** 条件显示 */
  ifShow?: IfShow;
  /** 事件配置 */
  events?: Record<string, string>;
  /** 生命周期钩子 */
  hooks?: Hooks;
}
```

## 完整示例

```json
{
  "type": "root",
  "designWidth": 750,
  "children": [
    {
      "type": "page",
      "field": "page1",
      "label": "首页",
      "pageStyles": {
        "backgroundColor": "#ffffff"
      },
      "children": [
        {
          "type": "container",
          "field": "container1",
          "label": "顶部容器",
          "style": {
            "padding": "20px",
            "backgroundColor": "#f5f5f5"
          },
          "children": [
            {
              "type": "node",
              "field": "title1",
              "label": "标题",
              "component": "q-text",
              "componentProps": {
                "text": "欢迎使用 Quantum Lowcode",
                "fontSize": "24px",
                "color": "#333333"
              },
              "style": {
                "marginBottom": "10px"
              }
            },
            {
              "type": "node",
              "field": "button1",
              "label": "按钮",
              "component": "q-button",
              "componentProps": {
                "text": "点击我",
                "type": "primary"
              },
              "style": {
                "marginTop": "10px"
              },
              "events": {
                "click": "handleButtonClick"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## 节点类型

### Root 节点

根节点是配置的顶层，包含所有页面：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 固定值 `root` |
| children | array | 是 | 页面数组 |
| dataSources | array | 否 | 数据源配置 |
| designWidth | number | 否 | 设计宽度，默认 750 |
| pageMaxWidth | number | 否 | 页面最大宽度 |

### Page 节点

页面节点代表一个完整的页面：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 固定值 `page` |
| field | string | 是 | 唯一标识 |
| label | string | 否 | 显示名称 |
| pageStyles | object | 否 | 页面样式 |
| children | array | 否 | 子节点数组 |

### Container 节点

容器节点用于分组和管理子组件：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 固定值 `container` |
| field | string | 是 | 唯一标识 |
| label | string | 否 | 显示名称 |
| style | object | 否 | 样式配置 |
| componentProps | object | 否 | 容器属性 |
| ifShow | object | 否 | 条件显示 |
| children | array | 否 | 子节点数组 |

### Node 节点

组件节点是最小配置单元：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 固定值 `node` |
| field | string | 是 | 唯一标识 |
| component | string | 是 | 组件类型 |
| label | string | 否 | 显示名称 |
| componentProps | object | 否 | 组件属性 |
| style | object | 否 | 样式配置 |
| ifShow | object | 否 | 条件显示 |
| events | object | 否 | 事件配置 |
| hooks | object | 否 | 生命周期钩子 |

## 条件显示 (ifShow)

条件显示用于控制组件是否可见：

```typescript
interface IfShow {
  /** 条件表达式 */
  expression: string;
  /** 依赖的数据源 */
  deps?: string[];
}
```

示例：

```json
{
  "ifShow": {
    "expression": "${dataSource.isVisible}",
    "deps": ["dataSource1"]
  }
}
```

## 事件配置 (events)

事件配置将用户操作与处理函数关联：

```json
{
  "events": {
    "click": "handleButtonClick",
    "change": "handleInputChange"
  }
}
```

## 生命周期钩子 (hooks)

组件生命周期钩子配置：

```typescript
interface Hooks {
  /** 组件创建时 */
  created?: string;
  /** 组件挂载时 */
  mounted?: string;
  /** 组件更新前 */
  beforeUpdate?: string;
  /** 组件更新后 */
  updated?: string;
  /** 组件销毁前 */
  beforeDestroy?: string;
  /** 组件销毁时 */
  destroyed?: string;
}
```

## 数据源绑定

可以在组件属性中使用数据源：

```json
{
  "componentProps": {
    "text": "${dataSource.userName}",
    "src": "${dataSource.avatarUrl}"
  }
}
```

## 下一步

- 阅读 [组件模型](./component-model.md) 了解组件定义
- 阅读 [核心包文档](./packages/core.md) 了解核心库 API
- 阅读 [数据源配置](./guides/datasource.md) 了解数据源使用
