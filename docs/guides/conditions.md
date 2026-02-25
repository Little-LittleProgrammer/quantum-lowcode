# 条件显示配置

本文档介绍如何配置组件的条件显示逻辑。

## 概述

条件显示（ifShow）用于根据数据源或表达式的值控制组件是否可见。

## 基本语法

### ifShow 结构

```typescript
interface IfShow {
  /** 条件表达式 */
  expression: string;
  /** 依赖的数据源 */
  deps?: string[];
}
```

## 表达式语法

### 1. 简单变量

```json
{
  "ifShow": {
    "expression": "${dataSource.isVisible}"
  }
}
```

### 2. 比较运算

```json
{
  "ifShow": {
    "expression": "${dataSource.count} > 0"
  }
}
```

支持的运算符：
- `==` 等于
- `!=` 不等于
- `>` 大于
- `<` 小于
- `>=` 大于等于
- `<=` 小于等于

### 3. 逻辑运算

```json
{
  "ifShow": {
    "expression": "${dataSource.isVip} && ${dataSource.count} > 0"
  }
}
```

支持的逻辑运算符：
- `&&` 且
- `||` 或
- `!` 非

### 4. 数据源字段

```json
{
  "ifShow": {
    "expression": "${user.isActive}"
  }
}
```

## 使用示例

### 基础示例

根据用户类型显示不同内容：

```json
{
  "type": "node",
  "field": "vipBadge",
  "component": "q-text",
  "componentProps": {
    "text": "VIP"
  },
  "ifShow": {
    "expression": "${user.isVip}"
  }
}
```

### 数值比较

根据数量显示提示：

```json
{
  "type": "node",
  "field": "emptyTip",
  "component": "q-text",
  "componentProps": {
    "text": "暂无数据"
  },
  "ifShow": {
    "expression": "${list.count} == 0"
  }
}
```

### 多条件组合

VIP 用户且积分大于 1000：

```json
{
  "type": "node",
  "field": "vipContent",
  "component": "q-container",
  "ifShow": {
    "expression": "${user.isVip} && ${user.points} > 1000"
  }
}
```

### 数组长度

数组非空时显示：

```json
{
  "type": "node",
  "field": "listContainer",
  "component": "q-list",
  "ifShow": {
    "expression": "${list.items.length} > 0"
  }
}
```

## 依赖配置

使用 `deps` 指定依赖的数据源，便于追踪更新：

```json
{
  "ifShow": {
    "expression": "${user.isVip}",
    "deps": ["user"]
  }
}
```

## 在编辑器中配置

1. 选中组件
2. 在右侧属性面板找到"条件显示"
3. 填写表达式
4. 选择依赖的数据源

## 运行时处理

核心库会在渲染前计算条件：

```typescript
import { compliedConditions } from '@quantum-lowcode/utils';

// 计算条件
const display = compliedConditions(
  ifShow,
  dataSourceData
);
```

## 注意事项

1. **性能**：避免在表达式中进行复杂计算
2. **依赖**：正确配置 deps 以确保数据更新时组件正确响应
3. **空值**：处理可能的空值情况

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
        "isVip": true,
        "points": 1500,
        "level": 3
      }
    }
  ],
  "children": [
    {
      "type": "page",
      "field": "page1",
      "children": [
        {
          "type": "node",
          "field": "userName",
          "component": "q-text",
          "componentProps": {
            "text": "${user.name}"
          }
        },
        {
          "type": "node",
          "field": "vipBadge",
          "component": "q-text",
          "componentProps": {
            "text": "VIP"
          },
          "ifShow": {
            "expression": "${user.isVip}",
            "deps": ["user"]
          }
        },
        {
          "type": "node",
          "field": "levelTip",
          "component": "q-text",
          "componentProps": {
            "text": "高级会员"
          },
          "ifShow": {
            "expression": "${user.isVip} && ${user.level} >= 2",
            "deps": ["user"]
          }
        },
        {
          "type": "node",
          "field": "pointsTip",
          "component": "q-text",
          "componentProps": {
            "text": "您的积分：${user.points}"
          },
          "ifShow": {
            "expression": "${user.points} > 0",
            "deps": ["user"]
          }
        }
      ]
    }
  ]
}
```

## 下一步

- 阅读 [Schema 协议](../schema.md) 了解完整配置格式
- 阅读 [数据源配置](./datasource.md) 了解数据源使用
