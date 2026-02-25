# @quantum-lowcode/data 数据源管理

数据源管理包，提供数据源管理和依赖追踪功能。

## 安装

```bash
pnpm add @quantum-lowcode/data-source
```

## 概述

数据源管理模块负责管理应用的数据源，支持 base 和 http 两种类型，并提供数据依赖追踪。

## 核心类

### DataSourceManager

数据源管理器。

```typescript
import { createDataSourceManager } from '@quantum-lowcode/data-source';
```

#### createDataSourceManager

创建数据源管理器：

```typescript
const manager = createDataSourceManager(app: LowCodeRoot, useMock?: boolean): DataSourceManager
```

#### 方法

##### init

初始化数据源：

```typescript
manager.init(dataSources: IDataSourceSchema[]): void
```

##### addDataSource

添加数据源：

```typescript
manager.addDataSource(config: IDataSourceSchema): void
```

##### get

获取数据源：

```typescript
const ds = manager.get(id: string): DataSource
```

##### setData

设置数据：

```typescript
manager.setData(ds: DataSource, cdata: any): void
```

##### updateSchema

更新数据源 Schema：

```typescript
manager.updateSchema(schemas: IDataSourceSchema[]): void
```

##### removeDataSource

移除数据源：

```typescript
manager.removeDataSource(id: string): void
```

##### track

追踪依赖：

```typescript
manager.track(sourceId: string, fieldId: string, data: any): void
```

##### trigger

触发更新：

```typescript
manager.trigger(dataSourceId: string, fieldId: string): void
```

##### destroy

销毁：

```typescript
manager.destroy(): void
```

### DataSource

基础数据源类。

```typescript
import { DataSource } from '@quantum-lowcode/data-source';
```

#### 属性

```typescript
const ds = new DataSource({
  id: 'ds-1',
  type: 'base',
  name: '用户数据',
  fields: [
    { field: 'name', type: 'string', name: '用户名' },
    { field: 'age', type: 'number', name: '年龄' }
  ],
  methods: [],
  data: {
    name: '张三',
    age: 18
  }
});

// 获取数据
ds.id;        // 'ds-1'
ds.type;      // 'base'
ds.name;      // '用户数据'
ds.data;      // { name: '张三', age: 18 }
```

#### 方法

##### setFields

设置字段：

```typescript
ds.setFields(fields: IDataSchema[]): void
```

##### setMethods

设置方法：

```typescript
ds.setMethods(methods: ICodeBlockContent[]): void
```

##### setData

设置数据：

```typescript
ds.setData(data: any, path?: string): void
```

##### getDefaultData

获取默认数据：

```typescript
const defaultData = ds.getDefaultData(): any
```

### HttpDataSource

HTTP 数据源类。

```typescript
import { HttpDataSource } from '@quantum-lowcode/data-source';
```

#### 属性

```typescript
const httpDs = new HttpDataSource({
  id: 'http-ds-1',
  type: 'http',
  name: '用户列表',
  httpOptions: {
    url: '/api/users',
    method: 'GET'
  },
  auto: true
});

// 状态
httpDs.isLoading;  // boolean
httpDs.error;      // Error | null
```

#### 方法

##### init

初始化并自动请求：

```typescript
await httpDs.init(): Promise<void>
```

##### request

发送请求：

```typescript
const result = await httpDs.request(options: IHttpOptions): Promise<any>
```

##### get

发送 GET 请求：

```typescript
const result = await httpDs.get({ url: '/api/users' }): Promise<any>
```

##### post

发送 POST 请求：

```typescript
const result = await httpDs.post({ url: '/api/users', data: {} }): Promise<any>
```

## 使用示例

### 基本使用

```typescript
import { createDataSourceManager } from '@quantum-lowcode/data-source';
import { LowCodeRoot } from '@quantum-lowcode/core';

// 创建应用
const app = new LowCodeRoot({ config: schema });

// 创建数据源管理器
const manager = createDataSourceManager(app);

// 添加数据源
manager.addDataSource({
  id: 'user-ds',
  type: 'base',
  name: '用户数据',
  fields: [
    { field: 'name', type: 'string', title: '用户名' },
    { field: 'age', type: 'number', title: '年龄' }
  ],
  data: { name: '张三', age: 18 }
});

// 添加 HTTP 数据源
manager.addDataSource({
  id: 'list-ds',
  type: 'http',
  name: '列表数据',
  httpOptions: {
    url: '/api/list',
    method: 'GET'
  },
  auto: true
});

// 获取数据源
const userDs = manager.get('user-ds');
console.log(userDs?.data); // { name: '张三', age: 18 }

// 更新数据
userDs?.setData({ name: '李四', age: 20 });
```

### 依赖追踪

```typescript
// 追踪依赖
manager.track('list-ds', 'button1', { show: true });

// 当数据源更新时，触发依赖更新
manager.trigger('list-ds', 'button1');
```

## 数据源 Schema

```typescript
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

interface IDataSchema {
  /** 字段名 */
  field: string;
  /** 字段类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  /** 显示名称 */
  title?: string;
  /** 默认值 */
  defaultValue?: any;
}
```

## 相关文档

- [数据源配置指南](../guides/datasource.md)
- [系统架构](../architecture.md)
