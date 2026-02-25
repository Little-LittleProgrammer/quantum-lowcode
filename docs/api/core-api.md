# 核心库 API

本文档提供 @quantum-lowcode/core 的完整 API 参考。

## LowCodeRoot

主应用类，管理整个低代码应用的生命周期。

### 构造函数

```typescript
class LowCodeRoot {
  constructor(options: IAppOptionsConfig)
}
```

### IAppOptionsConfig

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| config | ISchemasRoot | 否 | DSL 配置 |
| designWidth | number | 否 | 设计宽度，默认 750 |
| ua | string | 否 | User Agent |
| curPage | string | 否 | 当前页面 ID |
| platform | 'mobile' \| 'pc' \| 'editor' | 否 | 平台类型 |
| disabledFlexible | boolean | 否 | 禁用自适应 |
| transformStyle | (style: Record<string, any>) => Record<string, any> | 否 | 样式转换函数 |
| request | IRequestFunction | 否 | 请求函数 |
| useMock | boolean | 否 | 使用模拟数据 |

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| env | Env | 环境信息 |
| schemasRoot | ISchemasRoot | Schema 根节点 |
| page | LowCodePage | 当前页面 |
| platform | string | 平台类型 |
| components | Map<string, any> | 组件注册表 |
| request | IRequestFunction | 请求函数 |
| dataSourceManager | DataSourceManager | 数据源管理器 |
| transformStyle | Function | 样式转换函数 |

### 方法

#### setConfig

设置 DSL 配置。

```typescript
setConfig(config: ISchemasRoot, curPage?: Id): void
```

#### setPage

切换当前页面。

```typescript
setPage(field?: Id): void
```

#### getPage

获取页面实例。

```typescript
getPage(field?: Id): LowCodePage
```

#### registerComponent

注册组件。

```typescript
registerComponent(type: string, component: any): void
```

#### resolveComponent

解析组件。

```typescript
resolveComponent(type: string): any
```

#### registerEvent

注册事件处理函数。

```typescript
registerEvent(
  key: string,
  fn: Fn,
  ds?: DataSource,
  node?: LowCodeNode
): void
```

#### emit

触发事件。

```typescript
emit(name: string, ...args: any[]): void
```

#### isH5

检查是否在移动端。

```typescript
isH5(): boolean
```

#### destroy

销毁实例。

```typescript
destroy(): void
```

---

## LowCodePage

页面类，管理页面节点。

### 构造函数

```typescript
class LowCodePage {
  constructor(options: IConfigOptions)
}
```

### IConfigOptions

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| config | ISchemasPage | 是 | 页面配置 |
| root | LowCodeRoot | 是 | 根实例 |

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| nodes | Map<Id, LowCodeNode> | 页面节点 |
| data | ISchemasPage | 页面配置 |

### 方法

#### initNode

初始化节点。

```typescript
initNode(config: ISchemasNode, parent?: LowCodeNode): LowCodeNode
```

#### getNode

获取节点。

```typescript
getNode(field: Id): LowCodeNode | undefined
```

#### setNode

设置节点。

```typescript
setNode(field: Id, node: LowCodeNode): void
```

#### deleteNode

删除节点。

```typescript
deleteNode(field: Id): void
```

---

## LowCodeNode

节点类，代表单个组件或容器。

### 构造函数

```typescript
class LowCodeNode {
  constructor(options: INodeOptions)
}
```

### INodeOptions

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| config | ISchemasNode | 是 | 节点配置 |
| page | LowCodePage | 否 | 页面实例 |
| parent | LowCodeNode | 否 | 父节点 |
| root | LowCodeRoot | 是 | 根实例 |

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| data | ISchemasNode | 节点配置 |
| page | LowCodePage | 页面实例 |
| parent | LowCodeNode | 父节点 |
| root | LowCodeRoot | 根实例 |
| instance | any | 组件实例 |

### 方法

#### setData

设置节点数据并编译模板。

```typescript
setData(data: ISchemasNode): void
```

#### compileNode

编译节点模板表达式。

```typescript
compileNode(data: any): any
```

#### compileCond

编译条件显示。

```typescript
compileCond(data: any): boolean
```

#### setEvents

绑定事件处理函数。

```typescript
setEvents(config: ISchemasNode): void
```

#### listenLifeSafe

设置生命周期钩子。

```typescript
listenLifeSafe(): void
```

#### runCode

执行生命周期钩子代码。

```typescript
runCode(hook: string, emitData?: any): void
```

#### destroy

销毁节点。

```typescript
destroy(): void
```

---

## Env

环境检测类。

### 构造函数

```typescript
class Env {
  constructor(ua?: string)
}
```

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| isIos | boolean | iOS 设备 |
| isIphone | boolean | iPhone |
| isIpad | boolean | iPad |
| isAndroid | boolean | Android 设备 |
| isAndroidPad | boolean | Android Pad |
| isMac | boolean | macOS |
| isWin | boolean | Windows |
| isMqq | boolean | 手机 QQ |
| isWechat | boolean | 微信 |
| isWeb | boolean | 桌面浏览器 |

---

## Flexible

移动端自适应类。

### 构造函数

```typescript
class Flexible {
  constructor(options: { designWidth?: number })
}
```

### 方法

#### setDesignWidth

设置设计宽度。

```typescript
setDesignWidth(width: number): void
```

#### calcFontsize

计算并设置根字体大小。

```typescript
calcFontsize(): void
```

#### destroy

销毁实例。

```typescript
destroy(): void
```
