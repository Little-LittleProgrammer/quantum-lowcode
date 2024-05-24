# core

## 简介

处理 DSL, 存储处理后的DSL数据 , 可供 runtime 和ui库 调用api, 主要应用场景 runtime 过程

## app

### 功能

1.  处理根 DSL
2.  转换样式, px, deg, url
3.  订阅事件、注册组件
4.  声明 datasource
5.  处理 seo

### 样式处理

1.  需要处理的样式类型: `scale`, `backgroundImage`, `rotate`, `px => rem`
2.  `transform`: `rotate`增加deg
3.  `backgroundImage`: 增加`url()`
4.  `px => rem`: `${parseInt(value) / this.designWidth * 10}rem`

### 订阅事件

```js
this.eventMap.set(key, eventHanlder);
this.on(key, eventHanlder);
```

### interface

```ts
interface IAppOptionsConfig {
    config?: ISchemasRoot; // DSl
    designWidth?: number; // 设计稿大小
    ua?: string; // ua头
    curPage?: Id; // 当前页面id
    platform?: 'mobile' | 'pc'; 
    transformStyle?: (style: Record<string, any>) => Record<string, any>; // 处理 obj样式成style样式,包括 px => rem
    request?: IRequestFunction; 自定义请求方法
    useMock?: boolean;
}
export declare class LowCodeRoot extends Subscribe implements ILowCodeRoot {
    env: Env;
    schemasRoot?: ISchemasRoot;
    page?: LowCodePage; // 当前激活的page
    designWidth: number; // 设计图大小, 用来计算 rem
    platform: string;
    components: Map<any, any>; // 物料库组件
    request?: IRequestFunction;
    dataSourceManager?: DataSourceManager; // 数据源管理
    dataSourceDep: Map<Id, IDepData[]>; // 映射关系 ${a.b.c}
    useMock: boolean;
    private eventMap; // 事件存储
    constructor(options: IAppOptionsConfig);
    setEnv(ua?: string): void;
    setConfig(config: ISchemasRoot, curPage?: Id): void;
    private dealDescribe;
    private setDescribe;
    setPage(field?: Id): void; // 设置当前配置
    getPage(field?: Id): LowCodePage | undefined;
    deletePage(): void;
    setDesignWidth(width: number): void;
    transformStyle(style: Record<string, any> | string | Fn): Record<string, any>; // (value / designWidth * 10)
    isH5(): boolean;
    private getTransform;
    private calcFontsize;  // width / 10
    private setBodyFontSize; // 12 * dpr
    emit(name: string, ...args: any[]): void;
    registerEvent(key: string, fn: Fn, ds?: DataSource, node?: LowCodeNode): void; // dataSource调用, 注册事件
    removeEvents(): void;
    registerComponent(type: string, comp: any): void;
    unregisterComponent(type: string): void;
    resolveComponent(type: string): any;
    destroy(): void;
}
```

## page

### 功能

1.  处理 page 和 node DSL
2.  处理 datasourceDep影射, 节点删除后, 删除影射关系

### interface

```ts
export declare class LowCodePage extends LowCodeNode {
    nodes: Map<string, LowCodeNode>;
    constructor(options: IConfigOptions);
    initNode(config: ISchemasContainer | ISchemasNode, parent: LowCodeNode): void;
    getNode(field: Id): LowCodeNode | undefined;
    setNode(field: Id, node: LowCodeNode): void;
    deleteNode(field: Id): void;
    destroy(): void;
}
```

## node

### 功能

1.  setData时 编译`compileNode`, 并且记录到 `dataSourceDep`
2.  setEvents, 处理 `componentProps`里的方法与数组事件, 当执行方法时, 可发布订阅在app中的datasource事件
3.  listenLifeSafe: 通过订阅发布, 执行dsl中的 created 和 mounted 生命周期, 并在 mounted中注册组件暴露出来的事件

# datasource

## 简介

1.  处理 dsl中 datasource 部分, 包含 base 和 http 数据, 数据和方法

### field

1.  更新数据时 通过 ds.setData 方法更新, 在 page中订阅 ds的change事件, 来触发节点替换更新

### methods

1.  调用 app的 `registerEvent`, 将所有方法订阅在app中

## 数据响应式原理
> 每层步骤间通过 `emit, on` 触发

### 响应式也包括两个部分:
1. 响应数据的依赖收集
2. 响应数据的依赖触发

#### 依赖的收集
1. 初始化页面时, 需要递归 dsl生成 对应节点类, 当递归到节点数据时, 判断数据是否是`${a.b.c}`的格式, 如果是的话, 收集此依赖
2. 依赖收集格式
```js
Map{
    key: 'sourceID',
    value: Map{
        key: 'fieldID',
        value: Set[{
            field: NodeId;
            key: string;
            rawValue: string;
            type: 'data' | 'cond';
        }]
    }
}
```

#### 依赖触发
1. 当数据更新时, 根据收集依赖的`sourceID`, `fieldID`, 找到所有依赖的节点
2. 循环遍历依赖的节点, 根据`NodeId`获取原始节点, 根据 `type` 判断到底是 数据 还是 显示隐藏控制 类型
3. 进行下面步骤


### 数据响应式分为两部分:
1. 页面数据的更新
2. 页面节点的显示隐藏控制

#### 页面数据的更新
1. 当数据更新时, 触发(trigger)收集的依赖, 将已经转化为基本数据的依赖项, 通过`key(path)`, `rawValue(${a.b.c})` 还原成`${a.b.c}`的形式
2. 再通过 `node`的`compileNode`将还原的数据解析成更新后的数据
3. 更新节点
4. 将新节点对页面进行替换

#### 页面的显示隐藏控制
1. 当数据更新时, 触发(trigger)收集的依赖, 收集的依赖包括依赖此响应式数据的节点
2. 获取节点, 根据节点的`ifShow`字段判断新数据是否符合此显示条件, 将结果赋值在 `showResult`上
3. 更新节点
4. 将新节点对页面进行替换