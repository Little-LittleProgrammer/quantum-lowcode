# @quantum-lowcode/core 核心库

核心库是 Quantum Lowcode 的核心模块，负责数据模型定义、存储与处理，以及事件状态管理。

## 安装

```bash
pnpm add @quantum-lowcode/core
```

## 主要类

### LowCodeRoot

根节点类，管理系统生命周期、组件注册、事件处理。

```typescript
import { LowCodeRoot } from '@quantum-lowcode/core';
```

#### 构造函数

```typescript
interface IAppOptionsConfig {
  /** DSL 配置 */
  config?: ISchemasRoot;
  /** 设计宽度 */
  designWidth?: number;
  /** User Agent */
  ua?: string;
  /** 当前页面 ID */
  curPage?: Id;
  /** 平台类型 */
  platform?: 'mobile' | 'pc' | 'editor';
  /** 禁用自适应 */
  disabledFlexible?: boolean;
  /** 样式转换函数 */
  transformStyle?: (style: Record<string, any>) => Record<string, any>;
  /** 请求函数 */
  request?: IRequestFunction;
  /** 使用模拟数据 */
  useMock?: boolean;
}

const app = new LowCodeRoot(options);
```

##### 样式转换逻辑
┌─────────────────┬──────────────────────────────────────┬───────┐                                                     
│      名称        │                 说明                 │ 示例  │                                                     
├─────────────────┼──────────────────────────────────────┼───────┤                                                     
│ Editor 设计稿值  │ 720px 设计宽度下的像素值                │ 100px │
├─────────────────┼──────────────────────────────────────┼───────┤
│ Schema 存储值    │ 和 Editor 一样，存的就是设计稿像素值      │ 100   │
├─────────────────┼──────────────────────────────────────┼───────┤
│ Runtime rem 值  │ 实际渲染时的 rem 单位                   │ 1rem  │
└─────────────────┴──────────────────────────────────────┴───────┘
- Editor 和 Schema 存储用的是同一套 720px 设计尺寸
- Runtime 渲染时用 值/720*10 转换为 rem 自适应
- calcValueByDesignWidth 负责 Editor 和 Sandbox 之间的数值校准
- 程序计算值：比如鼠标位置
  1. 鼠标在 Editor 中获取位置
  // packages/editor/src/components/layouts/sandbox/index.vue:169-174
  // 获取鼠标在 sandbox 容器内的相对位置
  const clientX = e.clientX - containerRect.left;  // sandbox 内的像素值 (375px屏幕)
  const clientY = e.clientY - containerRect.top;

  // 加上滚动偏移
  const top = clientY + scrollTop;
  const left = clientX + scrollLeft;

  2. 转换为 Schema 存储值 (Editor 设计尺寸)
  // 关键转换函数
  top = calcValueByDesignWidth(doc, top, designWidth);
  left = calcValueByDesignWidth(doc, left, designWidth);

  // 公式: schema值 = sandbox像素值 × (720 / sandbox视口宽度)
  // 例如: 187 × (720 / 375) = 358 (存储到 schema)

  3. Sandbox 读取时逆向转换
  // packages/sandbox/src/box-drag-resize-helper.ts:478-479
  // 从 schema 读出来的值转回 sandbox 像素
  const left = calcValueByDesignWidth(doc, schema值, designWidth);
  // 公式: sandbox像素 = schema值 × (sandbox视口 / 720)

  4. Runtime 渲染时转为 rem
  // packages/core/src/utils.ts:66-70
  // 最终渲染到页面
  style.width = `${(schema值 / 720) * 10}rem`;

schema 最终存放的是设计稿值

#### 方法

##### setConfig

设置 DSL 配置：

```typescript
app.setConfig(config: ISchemasRoot, curPage?: Id): void
```

##### setPage

切换当前页面：

```typescript
app.setPage(field?: Id): void
```

##### getPage

获取页面实例：

```typescript
app.getPage(field?: Id): LowCodePage
```

##### registerComponent

注册组件：

```typescript
app.registerComponent(type: string, component: any): void
```

##### resolveComponent

解析组件：

```typescript
app.resolveComponent(type: string): any
```

##### registerEvent

注册事件处理函数：

```typescript
app.registerEvent(
  key: string,
  fn: Fn,
  ds?: DataSource,
  node?: LowCodeNode
): void
```

##### emit

触发事件：

```typescript
app.emit(name: string, ...args: any[]): void
```

##### isH5

检查是否在移动端：

```typescript
app.isH5(): boolean
```

##### destroy

销毁应用实例：

```typescript
app.destroy(): void
```

### LowCodePage

页面类，管理页面节点。

```typescript
import { LowCodePage } from '@quantum-lowcode/core';
```

#### 方法

##### initNode

初始化节点：

```typescript
page.initNode(config: ISchemasNode, parent?: LowCodeNode): LowCodeNode
```

##### getNode

获取节点：

```typescript
page.getNode(field: Id): LowCodeNode | undefined
```

##### setNode

设置节点：

```typescript
page.setNode(field: Id, node: LowCodeNode): void
```

##### deleteNode

删除节点：

```typescript
page.deleteNode(field: Id): void
```

### LowCodeNode

节点类，代表单个组件或容器。

```typescript
import { LowCodeNode } from '@quantum-lowcode/core';
```

#### 方法

##### setData

设置节点数据：

```typescript
node.setData(data: ISchemasNode): void
```

##### compileNode

编译节点模板表达式：

```typescript
node.compileNode(data: any): any
```

##### compileCond

编译条件显示：

```typescript
node.compileCond(data: any): boolean
```

##### setEvents

绑定事件处理函数：

```typescript
node.setEvents(config: ISchemasNode): void
```

##### listenLifeSafe

设置生命周期钩子：

```typescript
node.listenLifeSafe(): void
```

##### runCode

执行生命周期钩子代码：

```typescript
node.runCode(hook: string, emitData?: any): void
```

##### destroy

销毁节点：

```typescript
node.destroy(): void
```

### Env

环境检测工具类。

```typescript
import { Env } from '@quantum-lowcode/core';
```

#### 属性

```typescript
const env = new Env(userAgent);

// iOS 设备检测
env.isIos: boolean;
env.isIphone: boolean;
env.isIpad: boolean;

// Android 设备检测
env.isAndroid: boolean;
env.isAndroidPad: boolean;

// 操作系统检测
env.isMac: boolean;
env.isWin: boolean;

// 浏览器检测
env.isMqq: boolean;  // 手机QQ
env.isWechat: boolean; // 微信
env.isWeb: boolean;  // 桌面浏览器
```

### Flexible

移动端自适应工具类。

```typescript
import { Flexible } from '@quantum-lowcode/core';
```

#### 构造函数

```typescript
const flexible = new Flexible({
  designWidth: 750  // 设计宽度，默认 750
});
```

#### 方法

##### setDesignWidth

设置设计宽度：

```typescript
flexible.setDesignWidth(width: number): void
```

##### calcFontsize

计算并设置根字体大小：

```typescript
flexible.calcFontsize(): void
```

##### destroy

销毁实例：

```typescript
flexible.destroy(): void
```

## 使用示例

```typescript
import { LowCodeRoot } from '@quantum-lowcode/core';
import { QButton, QContainer, QText } from '@quantum-lowcode/ui';

// 创建应用实例
const app = new LowCodeRoot({
  config: {
    type: 'root',
    designWidth: 750,
    children: [{
      type: 'page',
      field: 'page1',
      children: []
    }]
  },
  designWidth: 750,
  ua: navigator.userAgent
});

// 注册组件
app.registerComponent('q-button', QButton);
app.registerComponent('q-container', QContainer);
app.registerComponent('q-text', QText);

// 设置配置
app.setConfig(schema);

// 切换页面
app.setPage('page1');

// 注册事件
app.registerEvent('handleClick', () => {
  console.log('Button clicked!');
});

// 销毁
app.destroy();
```

## 相关文档

- [系统架构](../architecture.md)
- [Schema 协议](../schema.md)
- [API 参考](../api/core-api.md)
