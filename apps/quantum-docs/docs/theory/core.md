# @quantum-lowcode/core 核心包文档

## 概述

`@quantum-lowcode/core` 是 Quantum 低代码平台的核心包，负责管理整个低代码应用的生命周期、数据模型转换、组件渲染、事件处理等核心功能。它提供了一套完整的运行时架构，支持多种数据源、组件类型和平台适配。

## 核心架构

### 主要组件

1. **LowCodeRoot** - 应用根实例，管理全局配置和生命周期
2. **LowCodePage** - 页面实例，管理页面级别的节点和数据
3. **LowCodeNode** - 节点实例，管理单个组件的配置和状态
4. **Env** - 环境检测，识别设备类型和浏览器环境
5. **Flexible** - 移动端适配，处理响应式布局和单位转换

### 数据流架构

```
DSL Schema → LowCodeRoot → LowCodePage → LowCodeNode → Component
     ↓              ↓           ↓            ↓
DataSource → DataSourceManager → Node Events → Component Props
```

## 核心类详解

### LowCodeRoot

应用的根实例，负责整个低代码应用的初始化和管理。

#### 主要功能

- **配置管理**：解析和管理 DSL 配置
- **页面切换**：管理多页面应用的路由和切换
- **组件注册**：注册和管理可用组件
- **数据源管理**：集成数据源管理器
- **事件总线**：提供全局事件通信机制
- **环境适配**：处理不同平台的适配逻辑

#### 核心 API

```typescript
// 创建应用实例
const app = new LowCodeRoot({
  config: schemas,          // DSL 配置
  platform: 'mobile',      // 平台类型
  designWidth: 375,        // 设计稿宽度
  request: customRequest,  // 自定义请求函数
  useMock: true           // 是否使用 Mock 数据
});

// 设置配置
app.setConfig(newConfig, pageId);

// 切换页面
app.setPage(pageId);

// 注册组件
app.registerComponent('Button', ButtonComponent);

// 注册事件
app.registerEvent('click', handleClick);
```

#### 生命周期

1. **初始化阶段**
   - 设置环境信息
   - 初始化移动端适配
   - 创建数据源管理器

2. **配置阶段**
   - 解析 DSL 配置
   - 注册数据源
   - 设置页面描述信息

3. **运行阶段**
   - 页面渲染
   - 事件处理
   - 数据绑定

4. **销毁阶段**
   - 清理事件监听
   - 销毁页面实例
   - 释放资源

### LowCodePage

页面级别的管理类，负责管理页面内的所有节点。

#### 主要功能

- **节点管理**：创建、查询、删除页面内的节点
- **数据传递**：管理页面级别的数据流
- **生命周期**：处理页面级别的生命周期事件

#### 核心 API

```typescript
// 获取节点
const node = page.getNode(nodeId);

// 设置节点
page.setNode(nodeId, nodeInstance);

// 删除节点
page.deleteNode(nodeId);

// 初始化节点树
page.initNode(config, parentNode);
```

### LowCodeNode

节点级别的管理类，是低代码平台中最核心的类，负责管理单个组件的完整生命周期。

#### 主要功能

- **数据编译**：处理模板表达式和数据绑定
- **依赖收集**：收集数据源依赖关系
- **事件绑定**：处理组件事件和生命周期
- **条件渲染**：处理条件显示逻辑

#### 核心 API

```typescript
// 设置节点数据
node.setData(newConfig);

// 编译节点
const compiledConfig = node.compileNode(config);

// 编译条件
node.compileCond(config);

// 设置事件
node.setEvents(config);
```

#### 数据绑定机制

LowCodeNode 支持强大的数据绑定功能：

```typescript
// 模板表达式示例
const config = {
  componentProps: {
    text: '${dataSource.userName}',      // 数据绑定
    visible: '${dataSource.isVisible}',  // 条件绑定
    onClick: [                           // 事件绑定
      { field: 'dataSource:updateUser', params: {} }
    ]
  }
};
```

#### 生命周期钩子

支持多种生命周期钩子：

```typescript
const nodeConfig = {
  // 组件创建时
  created: (node) => {
    console.log('Node created:', node);
  },
  
  // 组件挂载时
  mounted: (node) => {
    console.log('Node mounted:', node);
  },
  
  // 组件销毁时
  destroy: () => {
    console.log('Node destroyed');
  }
};
```

### Env

环境检测类，用于识别运行环境和设备类型。

#### 检测能力

- **设备类型**：iOS、Android、PC
- **浏览器环境**：微信、QQ、Safari、Chrome 等
- **设备特性**：屏幕尺寸、像素密度等

#### 使用示例

```typescript
const env = new Env();

if (env.isIos) {
  // iOS 特定逻辑
} else if (env.isAndroid) {
  // Android 特定逻辑
}

if (env.isWechat) {
  // 微信环境特定逻辑
}
```

### Flexible

移动端适配类，处理响应式布局和单位转换。

#### 适配策略

- **rem 单位**：基于设计稿宽度计算根字体大小
- **响应式**：监听屏幕尺寸变化，动态调整
- **高分辨率**：处理高 DPI 屏幕的适配

#### 配置选项

```typescript
const flexible = new Flexible({
  designWidth: 375  // 设计稿宽度
});

// 动态设置设计稿宽度
flexible.setDesignWidth(750);
```

## 核心特性

### 1. 数据绑定系统

#### 模板表达式

支持强大的模板表达式系统：

```typescript
// 基础绑定
'${dataSource.fieldName}'

// 嵌套绑定
'${dataSource.user.name}'

// 条件绑定
'${dataSource.isVip ? "VIP用户" : "普通用户"}'
```

#### 依赖收集

自动收集数据依赖，实现响应式更新：

```typescript
// 当 dataSource.userName 变化时，自动更新相关组件
{
  componentProps: {
    text: '${dataSource.userName}'
  }
}
```

### 2. 事件系统

#### 事件绑定方式

支持多种事件绑定方式：

```typescript
// 1. 函数式绑定
onClick: (app, event) => {
  app.emit('user:update', { id: 1 });
}

// 2. 配置式绑定
onClick: [
  { field: 'dataSource:loadData', params: {} },
  { field: 'user:showModal', params: { title: '提示' } }
]
```

#### 事件命名空间

支持事件命名空间，避免冲突：

```typescript
// 全局事件
app.emit('globalEvent', data);

// 组件事件
app.emit('Button_001:click', data);

// 数据源事件
app.emit('userDataSource:update', data);
```

### 3. 条件渲染

#### 条件配置

支持复杂的条件渲染逻辑：

```typescript
{
  ifShow: [
    {
      field: ['dataSource', 'userType'],
      op: 'eq',
      value: 'admin'
    },
    {
      field: ['dataSource', 'isActive'],
      op: 'eq',
      value: true
    }
  ]
}
```

#### 支持的操作符

- `eq`：等于
- `ne`：不等于
- `gt`：大于
- `lt`：小于
- `gte`：大于等于
- `lte`：小于等于
- `in`：包含
- `nin`：不包含

### 4. 样式转换

#### 单位转换

自动将数值转换为 rem 单位：

```typescript
// 输入
{
  width: 100,
  height: 50,
  fontSize: 16
}

// 输出（设计稿宽度为 375）
{
  width: '2.67rem',
  height: '1.33rem',
  fontSize: '0.43rem'
}
```

#### 样式处理

支持多种样式处理：

- **背景图片**：自动添加 url() 包装
- **变换**：处理 transform 属性
- **响应式**：基于设计稿宽度缩放

## 使用示例

### 基础使用

```typescript
import { LowCodeRoot } from '@quantum-lowcode/core';

// 创建应用
const app = new LowCodeRoot({
  config: schemas,
  platform: 'mobile',
  designWidth: 375
});

// 注册组件
app.registerComponent('Button', ButtonComponent);
app.registerComponent('Text', TextComponent);

// 监听页面变化
app.on('page-change', (page) => {
  console.log('当前页面:', page);
});

// 切换页面
app.setPage('homePage');
```

### 数据源集成

```typescript
// 配置数据源
const schemas = {
  dataSources: [
    {
      id: 'userApi',
      type: 'http',
      options: {
        url: '/api/user',
        method: 'GET'
      }
    }
  ],
  children: [
    {
      field: 'userInfo',
      type: 'Text',
      componentProps: {
        text: '${userApi.name}'  // 绑定数据源
      }
    }
  ]
};

const app = new LowCodeRoot({ config: schemas });
```

### 事件处理

```typescript
// 注册全局事件
app.registerEvent('showAlert', ({ app }) => {
  alert('Hello from Low Code!');
});

// 组件事件配置
const buttonConfig = {
  type: 'Button',
  componentProps: {
    text: '点击我',
    onClick: [
      { field: 'showAlert', params: {} }
    ]
  }
};
```

## 最佳实践

### 1. 组件设计

- **职责单一**：每个组件只负责一个功能
- **数据驱动**：通过 props 接收数据，避免内部状态
- **事件上报**：通过事件与外部通信

### 2. 数据管理

- **集中管理**：使用数据源统一管理数据
- **响应式更新**：利用依赖收集实现自动更新
- **错误处理**：妥善处理数据加载失败的情况

### 3. 性能优化

- **按需加载**：组件和数据源按需加载
- **缓存策略**：合理使用缓存减少重复请求
- **内存管理**：及时清理不用的资源

### 4. 错误处理

- **边界处理**：处理各种边界情况
- **用户友好**：提供友好的错误提示
- **日志记录**：记录关键操作和错误信息

## 总结

`@quantum-lowcode/core` 提供了一个完整的低代码运行时架构，支持：

- 🎯 **数据驱动**：强大的数据绑定和响应式更新
- 🎪 **事件系统**：灵活的事件绑定和处理机制
- 🎨 **样式适配**：智能的样式转换和移动端适配
- 🎮 **组件管理**：完整的组件生命周期管理
- 🎵 **条件渲染**：复杂的条件显示逻辑支持
- 🎸 **环境适配**：多平台和多环境的适配能力

通过这些核心功能，开发者可以快速构建功能丰富、性能优秀的低代码应用。
