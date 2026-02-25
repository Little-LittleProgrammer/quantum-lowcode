# 数据源配置

本文档介绍如何在 Quantum Lowcode 中配置和使用数据源。

## 概述

数据源用于管理应用的数据，支持静态数据和动态 HTTP 请求。

## 数据源类型

### 1. 基础数据源 (base)

用于存储静态数据：

```typescript
{
  id: 'user-ds',
  type: 'base',
  name: '用户信息',
  fields: [
    { field: 'name', type: 'string', title: '用户名' },
    { field: 'age', type: 'number', title: '年龄' }
  ],
  data: {
    name: '张三',
    age: 18
  }
}
```

### 2. HTTP 数据源 (http)

用于动态请求数据：

```typescript
{
  id: 'list-ds',
  type: 'http',
  name: '列表数据',
  httpOptions: {
    url: '/api/list',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  auto: true  // 自动请求
}
```

## 配置数据源

### 在 Schema 中配置

```json
{
  "type": "root",
  "designWidth": 750,
  "dataSources": [
    {
      "id": "user-ds",
      "type": "base",
      "name": "用户信息",
      "fields": [
        { "field": "name", "type": "string", "title": "用户名" }
      ],
      "data": { "name": "张三" }
    },
    {
      "id": "list-ds",
      "type": "http",
      "name": "列表数据",
      "httpOptions": {
        "url": "/api/users",
        "method": "GET"
      },
      "auto": true
    }
  ],
  "children": []
}
```

### 在编辑器中配置

1. 打开编辑器
2. 切换到"数据源"面板
3. 点击"添加数据源"
4. 选择数据源类型
5. 填写配置信息
6. 保存

## 使用数据源

### 组件属性绑定

在组件属性中使用数据源：

```json
{
  "component": "q-text",
  "componentProps": {
    "text": "${user-ds.name}"
  }
}
```

### 数组数据遍历

```json
{
  "component": "q-list",
  "componentProps": {
    "data": "${list-ds.data}"
  }
}
```

## HTTP 数据源配置

### 请求配置

```typescript
{
  "httpOptions": {
    "url": "/api/users",
    "method": "GET",  // GET, POST, PUT, DELETE
    "headers": {
      "Authorization": "Bearer token"
    },
    "data": {
      // POST 请求体
    },
    "timeout": 5000
  }
}
```

### 自动请求

```typescript
{
  "auto": true  // 组件加载后自动请求
}
```

### 手动请求

在需要时调用：

```typescript
const ds = dataSourceManager.get('list-ds');
ds.request();
```

## 字段定义

定义数据源字段：

```typescript
{
  "fields": [
    {
      "field": "id",
      "type": "string",
      "title": "ID"
    },
    {
      "field": "name",
      "type": "string",
      "title": "名称"
    },
    {
      "field": "count",
      "type": "number",
      "title": "数量",
      "defaultValue": 0
    }
  ]
}
```

### 字段类型

| 类型 | 说明 |
|------|------|
| string | 字符串 |
| number | 数字 |
| boolean | 布尔值 |
| object | 对象 |
| array | 数组 |

## 数据更新

### 设置数据

```typescript
const ds = dataSourceManager.get('user-ds');
ds.setData({ name: '李四' });
```

### 监听数据变化

```typescript
ds.on('change', (data) => {
  console.log('数据变化:', data);
});
```

## 依赖追踪

当数据源更新时，自动更新依赖的组件：

```typescript
// 追踪依赖
dataSourceManager.track('user-ds', 'text-node', { field: 'name' });

// 触发更新
dataSourceManager.trigger('user-ds', 'text-node');
```

## 条件显示中的数据源

在条件显示中使用数据源：

```json
{
  "ifShow": {
    "expression": "${user-ds.isVisible}",
    "deps": ["user-ds"]
  }
}
```

## 完整示例

```json
{
  "type": "root",
  "designWidth": 750,
  "dataSources": [
    {
      "id": "user",
      "type": "base",
      "name": "用户信息",
      "data": {
        "name": "张三",
        "avatar": "https://example.com/avatar.png",
        "isVip": true
      }
    },
    {
      "id": "products",
      "type": "http",
      "name": "产品列表",
      "httpOptions": {
        "url": "/api/products",
        "method": "GET"
      },
      "auto": true
    }
  ],
  "children": [
    {
      "type": "page",
      "field": "page1",
      "children": [
        {
          "type": "node",
          "field": "avatar",
          "component": "q-img",
          "componentProps": {
            "src": "${user.avatar}",
            "width": 80,
            "height": 80
          }
        },
        {
          "type": "node",
          "field": "name",
          "component": "q-text",
          "componentProps": {
            "text": "${user.name}"
          },
          "ifShow": {
            "expression": "${user.isVip}",
            "deps": ["user"]
          }
        }
      ]
    }
  ]
}
```

## 下一步

- 阅读 [条件显示](./conditions.md) 了解条件显示配置
- 阅读 [组件开发](./component-dev.md) 学习自定义组件开发
