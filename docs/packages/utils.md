# @quantum-lowcode/utils 工具函数

工具函数包，提供 DOM 操作、数据处理、事件系统等功能。

## 安装

```bash
pnpm add @quantum-lowcode/utils
```

## 模块

### index - 核心工具

#### getHost

获取 URL 主机名：

```typescript
import { getHost } from '@quantum-lowcode/utils';

getHost('https://example.com/path'); // 'example.com'
```

#### isSameDomain

检查是否同域：

```typescript
import { isSameDomain } from '@quantum-lowcode/utils';

isSameDomain('https://a.com', 'https://a.com/page'); // true
```

#### getNodePath

获取节点路径：

```typescript
import { getNodePath } from '@quantum-lowcode/utils';

const path = getNodePath('node-1', data);
```

#### filterXss

XSS 过滤：

```typescript
import { filterXss } from '@quantum-lowcode/utils';

filterXss('<script>alert(1)</script>'); // '&lt;script&gt;alert(1)&lt;/script&gt;'
```

#### getUrlParam

获取 URL 参数：

```typescript
import { getUrlParam } from '@quantum-lowcode/utils';

getUrlParam('id', 'https://example.com?id=123'); // '123'
```

#### parseFunction

解析函数字符串：

```typescript
import { parseFunction } from '@quantum-lowcode/utils';

const fn = parseFunction('function() { return this.data; }');
```

#### replaceChildNode

替换子节点：

```typescript
import { replaceChildNode } from '@quantum-lowcode/utils';

const newData = replaceChildNode(newNode, data, parentId);
```

#### compiledNode

编译节点模板：

```typescript
import { compiledNode } from '@quantum-lowcode/utils';

const result = compiledNode(node, (key) => value, sourceId);
```

#### compliedCondition

编译条件表达式：

```typescript
import { compliedCondition } from '@quantum-lowcode/utils';

const result = compliedCondition('==', fieldValue, inputValue);
```

#### isPage / isContainerNode

类型检查：

```typescript
import { isPage, isContainerNode } from '@quantum-lowcode/utils';

isPage(node); // boolean
isContainerNode(node); // boolean
```

### error - 错误处理

#### native_try_catch

安全执行函数：

```typescript
import { native_try_catch } from '@quantum-lowcode/utils';

native_try_catch(
  () => { /* 可能出错代码 */ },
  (error) => { /* 错误处理 */ }
);
```

### subscribe - 事件系统

#### Subscribe

事件订阅类：

```typescript
import { Subscribe } from '@quantum-lowcode/utils';

const emitter = new Subscribe();

// 订阅
emitter.on('event-name', (data) => {
  console.log(data);
});

// 单次订阅
emitter.once('event-name', (data) => {
  console.log(data);
});

// 发布
emitter.emit('event-name', { message: 'hello' });

// 取消订阅
emitter.remove('event-name');

// 清空所有
emitter.clear();
```

### fetch - HTTP 请求

#### webRequest

发送 HTTP 请求：

```typescript
import { webRequest } from '@quantum-lowcode/utils';

const response = await webRequest({
  url: '/api/data',
  method: 'GET'
});
```

#### urlencoded

URL 编码：

```typescript
import { urlencoded } from '@quantum-lowcode/utils';

urlencoded({ key: 'value' }); // 'key=value'
```

### dom - DOM 操作

#### injectStyle

注入样式：

```typescript
import { injectStyle } from '@quantum-lowcode/utils';

injectStyle(document, '.class { color: red; }');
```

#### getParents

获取父元素：

```typescript
import { getParents } from '@quantum-lowcode/utils';

const parents = getParents(element, (el) => el.tagName === 'DIV');
```

#### createElement

创建元素：

```typescript
import { createElement } from '@quantum-lowcode/utils';

const el = createElement({
  tag: 'div',
  cssText: 'color: red;',
  className: 'my-class'
});
```

#### getAbsolutePosition

获取绝对位置：

```typescript
import { getAbsolutePosition } from '@quantum-lowcode/utils';

const pos = getAbsolutePosition(el, { top: 0, left: 0 });
```

#### isFixedParent

检查是否有 fixed 定位的父元素：

```typescript
import { isFixedParent } from '@quantum-lowcode/utils';

isFixedParent(el); // boolean
```

#### getScrollParent

获取滚动父元素：

```typescript
import { getScrollParent } from '@quantum-lowcode/utils';

const scrollParent = getScrollParent(el);
```

#### asyncLoadJs

异步加载 JS：

```typescript
import { asyncLoadJs } from '@quantum-lowcode/utils';

await asyncLoadJs('https://example.com/script.js');
```

### style - 样式工具

#### style2Obj

样式字符串转对象：

```typescript
import { style2Obj } from '@quantum-lowcode/utils';

style2Obj('color: red; font-size: 14px;');
// { color: 'red', fontSize: '14px' }
```

#### fillBackgroundImage

确保背景图有 url 包装：

```typescript
import { fillBackgroundImage } from '@quantum-lowcode/utils';

fillBackgroundImage('https://example.com/bg.jpg');
// 'url(https://example.com/bg.jpg)'
```

## 使用示例

```typescript
import {
  getHost,
  getUrlParam,
  Subscribe,
  webRequest,
  injectStyle
} from '@quantum-lowcode/utils';

// URL 处理
const host = getHost(window.location.href);
const id = getUrlParam('id');

// 事件系统
const emitter = new Subscribe();
emitter.on('update', (data) => console.log(data));
emitter.emit('update', { count: 1 });

// HTTP 请求
const data = await webRequest({
  url: '/api/users',
  method: 'GET'
});

// 注入样式
injectStyle(document, `
  .quantum-page {
    min-height: 100vh;
  }
`);
```

## 相关文档

- [系统架构](../architecture.md)
