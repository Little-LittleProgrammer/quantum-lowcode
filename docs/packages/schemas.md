# @quantum-lowcode/schemas 类型定义

类型定义包，提供 Quantum Lowcode 的 TypeScript 类型定义。

## 安装

```bash
pnpm add @quantum-lowcode/schemas
```

## 主要类型

### ISchemasNode

组件节点类型：

```typescript
import { ISchemasNode } from '@quantum-lowcode/schemas';

interface ISchemasNode {
  /** 节点类型 */
  type: 'node';
  /** 唯一标识 */
  field: string;
  /** 组件类型 */
  component: string;
  /** 组件属性 */
  componentProps?: Record<string, any>;
  /** 样式 */
  style?: Record<string, any>;
  /** 条件显示 */
  ifShow?: IfShow;
  /** 事件配置 */
  events?: Record<string, string>;
  /** 生命周期钩子 */
  hooks?: Hooks;
}
```

### ISchemasContainer

容器节点类型：

```typescript
import { ISchemasContainer } from '@quantum-lowcode/schemas';

interface ISchemasContainer extends ISchemasNode {
  type: 'container';
  /** 子节点 */
  children?: ISchemasNode[];
}
```

### ISchemasPage

页面节点类型：

```typescript
import { ISchemasPage } from '@quantum-lowcode/schemas';

interface ISchemasPage extends ISchemasContainer {
  type: 'page';
  /** 页面样式 */
  pageStyles?: Record<string, any>;
}
```

### ISchemasRoot

根节点类型：

```typescript
import { ISchemasRoot } from '@quantum-lowcode/schemas';

interface ISchemasRoot {
  type: 'root';
  /** 子页面 */
  children: ISchemasPage[];
  /** 数据源 */
  dataSources?: IDataSourceSchema[];
  /** 设计宽度 */
  designWidth?: number;
  /** 页面最大宽度 */
  pageMaxWidth?: number;
}
```

### IfShow

条件显示类型：

```typescript
import { IfShow } from '@quantum-lowcode/schemas';

interface IfShow {
  /** 条件表达式 */
  expression: string;
  /** 依赖的数据源 */
  deps?: string[];
}
```

### Hooks

生命周期钩子类型：

```typescript
import { Hooks } from '@quantum-lowcode/schemas';

interface Hooks {
  created?: string;
  mounted?: string;
  beforeUpdate?: string;
  updated?: string;
  beforeDestroy?: string;
  destroyed?: string;
}
```

### IDataSourceSchema

数据源类型：

```typescript
import { IDataSourceSchema } from '@quantum-lowcode/schemas';

interface IDataSourceSchema {
  /** 数据源 ID */
  id: string;
  /** 数据源类型 */
  type: 'base' | 'http';
  /** 数据源名称 */
  name: string;
  /** 字段定义 */
  fields?: IDataSchema[];
  /** 方法定义 */
  methods?: ICodeBlockContent[];
  /** HTTP 配置 */
  httpOptions?: IHttpOptions;
  /** 自动请求 */
  auto?: boolean;
}
```

### IHttpOptions

HTTP 请求配置：

```typescript
import { IHttpOptions } from '@quantum-lowcode/schemas';

interface IHttpOptions {
  /** 请求 URL */
  url: string;
  /** 请求方法 */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** 请求头 */
  headers?: Record<string, string>;
  /** 请求体 */
  data?: any;
  /** 超时时间 */
  timeout?: number;
}
```

## 枚举

### NodeType

节点类型枚举：

```typescript
import { NodeType } from '@quantum-lowcode/schemas';

enum NodeType {
  NODE = 'node',
  CONTAINER = 'container',
  PAGE = 'page',
  ROOT = 'root'
}
```

### EventType

事件类型枚举：

```typescript
import { EventType } from '@quantum-lowcode/schemas';

enum EventType {
  CLICK = 'click',
  CHANGE = 'change',
  TOUCH = 'touch'
}
```

### ActionType

操作类型枚举：

```typescript
import { ActionType } from '@quantum-lowcode/schemas';

enum ActionType {
  COMP = 'comp',
  DATA_SOURCE = 'dataSource'
}
```

## 常量

```typescript
import { DEFAULT_DESIGN_WIDTH, DEFAULT_PAGE_MAX_WIDTH } from '@quantum-lowcode/schemas';

// 默认设计宽度
DEFAULT_DESIGN_WIDTH; // 750

// 默认页面最大宽度
DEFAULT_PAGE_MAX_WIDTH; // 4500
```

## 使用示例

```typescript
import {
  ISchemasRoot,
  ISchemasPage,
  ISchemasNode,
  IDataSourceSchema
} from '@quantum-lowcode/schemas';

// 创建 Schema
const schema: ISchemasRoot = {
  type: 'root',
  designWidth: 750,
  children: [
    {
      type: 'page',
      field: 'page1',
      children: [
        {
          type: 'node',
          field: 'button1',
          component: 'q-button',
          componentProps: {
            text: '点击'
          }
        }
      ]
    }
  ]
};
```

## 相关文档

- [Schema 协议](../schema.md)
- [组件模型](../component-model.md)
