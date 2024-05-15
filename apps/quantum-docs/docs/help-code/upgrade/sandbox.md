[TOC]

# 画布功能介绍

画布是编辑器中最核心的功能，处理组件拖拽和所见即所得的展示。

## 已选组件的组件树

已选组件列表，组件列表也可以单选、多选、高亮、删除、拖拽组件到容器内<br /><br />

## 画布支持的功能

*   渲染runtime
*   从编辑器增加组件，可以在左侧组件列表中通过单击/拖拽往画布中加入组件
*   删除组件，在画布中右键单击组件，在弹出菜单中删除；或者在左侧已选组件的组件树中右键删除组件
*   单选拖拽组件，可以在画布中选中组件，也可以在左侧目录中
*   多选拖拽组件，通过按住ctrl健选中多个组件
*   拖拽改变组件大小
*   旋转组件
*   高亮组件，在画布中mousemove经过组件的时候，或者在组件树中mousemove经过组件的时候，高亮组件
*   配置组件，单选选中组件之后，右侧表单区域对组件进行配置，并更新组件的渲染
*   添加/删除/隐藏/显示参考线，通过在标尺中往画布中拖拽，给画布添加参考线，图中两条竖向和一天横向的红色线条就是参考线
*   辅助对齐，单选和多选都支持拖拽过程中会辅助对齐其它组件，并在靠近参考线时吸附到参考线
*   拖拽组件进入容器，支持通过在画布中单选，或者在组件树中单选，将组件拖拽进入容器
*   包括大量的可配置化api, 通过消息发布暴露:  `get-elements-from-point`, `select`, `multi-select`, `dblclick`, `update`, `sort`, `select-parent`, `remove`, `highlight`, `mousemove`, `mouseleave`, `drag-start`, `page-el-update`, `runtime-ready`, `mounted`

# 核心类介绍

## BoxCore

*   负责统一对外接口，编辑器通过BoxCore传入runtime、添加/删除组件、缩放画布、更新参考线和标尺等；同时BoxCore也会对外抛出事件，比如组件选中、多选、高亮、更新，runtimeReady等。
*   管理三个核心类：BoxRender、BoxMask、ActionManager
*   可通过 editorService.sandbox调用内部方法

### 问题

1.  会不会触发 sandbox 和 editor的循环调用
    1.  sandbox => editor

        | sandbox                              | editor                   |
        | ------------------------------------ | ------------------------ |
        | `dragResize.on('drag')`              |                          |
        | `dragResize.update`                  |                          |
        | `dragResize.emit('update'`           |                          |
        | `actionManage.emit('update`          |                          |
        | `boxCore.emit('update`, 计算好的位置+更新的节点 |                          |
        |                                      | `editor.on('update'`     |
        |                                      | `editorService.update()` |
        |                                      | `sandbox.update()`       |
        | `renderer.update`                    |                          |
        | `mask.setLayout`                     |                          |
        | `actionManager.setSelectedEl`        |                          |
        | `actionManager.updateMoveable`       |                          |
        | `actionManager.updateMoveable`       |                          |
        |                                      |                          |

    2.  editor => sandbox
        | sandbox                                      | editor                   |
        | -------------------------------------------- | ------------------------ |
        |                                              | `editorService.update()` |
        |                                              | `sandbox.update()`       |
        | `renderer.update`                            |                          |
        | `mask.setLayout`                             |                          |
        | `actionManager.setSelectedEl`                |                          |
        | `actionManager.updateMoveable`               |                          |
        | `dragResize.init`                            |                          |
        | `dragResizeHelper.updateShadowEl`会更新shadow元素 |                          |
        | `shadow.update => shadow.updateEL`           |                          |
        | `moveable.updateRect`                        |                          |
        |                                              |                          |

## BoxRender

基于iframe加载传入进来的runtimeUrl，并支持增删改查组件。还提供了一个核心API：getElementsFromPoint，该API负责获取指定坐标下所有dom节点。

### 步骤

1.  `sandbox.vue` 初始化`boxCore`,  `boxCore` 初始化`render,` 传入 `runtimeUrl`, 生成`iframe`, 并监听 `iframe` 的 `loadHandler`(往iframe中注入quantumApi, 下面 runtime获取部分解释)
2.  `sandbox.vue` 调用 `mount`, 传入挂载元素root, 将 `iframe` 挂载到`root`上
3.  `initRenderEvent`: 监听 `runtime-ready、page-el-update`, 负责执行对应逻辑与通知`editor`
4.  触发boxCore 的 `add`、`update`、`delete`、`select`, 会触发 boxRender的对应方法, 然后再调用 runtime对应的方法

### runtime 获取

1.  往 `iframe`上注入 `quantum` 方法

```js
onPageElUpdate: (el: HTMLElement) => { this.emit('page-el-update', el); },
onRuntimeReady: (runtime: IRuntime) => {
    this.runtime = runtime;
    // 赋值 runtime
    (globalThis as any).runtime = runtime;
    // 触发 运行时ready 事件
    this.emit('runtime-ready', runtime);
},
```

1.  runtime 执行 `onRuntimeReady` 方法注入 runtime
2.  getApi 订阅 `runtime-ready`事件, 返回promise

```ts
if (this.runtime) return Promise.resolve(this.runtime);
return new Promise((resolve) => {
    const listener = (runtime: IRuntime) => {
        this.remove('runtime-ready');
        resolve(runtime);
    };
    this.on('runtime-ready', listener);
});
```

### 得到鼠标悬浮坐标的runtime 元素

```ts
public getElementsFromPoint(point: IPoint): HTMLElement[] {
    let x = point.clientX;
    let y = point.clientY;
    if (this.iframe) {
        const rect = this.iframe.getClientRects()[0];
        if (rect) {
            x = x - rect.left;
            y = y - rect.top;
        }
    }
    return this.getDocument()?.elementsFromPoint(x / this.zoom, y / this.zoom) as HTMLElement[];
}
```

## BoxMask

mask是一个盖在画布区域的一个蒙层，主要作用是隔离鼠标事件，避免鼠标事件直接作用于runtime中的组件，从而避免触发组件本身的点击事件（比如链接组件会跳走）。mask在滚动画布时，需要保证同步大小。后续的操作都在 mask 中完成 并同步更新到 runtime上

### 步骤

1.  sandbox.vue 初始化boxCore,  boxCore 初始化boxMask, 生成 wrapper(mask父容器) 和 content(mask), 并监听滚轮事件, 鼠标滚动时更改transform,来实现滚动
2.  `sandbox.vue` 调用 `mount`, 传入挂载元素root, 将 `wrapper` 挂载到`root`上
3.  处理完`render`的逻辑, 会触发`page-el-update`事件, 然后调用 `mask.observe` 与 `boxcore.observePageResize`(就是下面页面发生改变的逻辑)
4.  `initMaskEvent`: 目前未使用, 可后期扩展

### 页面发生改变(observePageResize)

1.  重新生成 `IntersectionObserver`(判断元素是否在窗口, 并滚动到指定元素) 和 `ResizeObserver`(获得最大可滚动值, 遮罩容器大小)
2.  重新设置 `mask-warpper` 和 `mask`的宽高, 以及最大可滚动值

## ActionManager

*   负责监听鼠标和键盘事件，基于这些事件，形成单选、多选、高亮行为。主要监听的是蒙层上的鼠标事件，通过BoxRender.getElementsFromPoint计算获得鼠标下方的组件，实现事件监听和实际组件的解构。
*   向上负责跟BoxCore双向通信，提供接口供core调用，并向core抛出事件
*   向下管理BoxDragResize、BoxMultiDragResize、BoxHighlight这三个单选、多选、高亮类，让它们协同工作

### 步骤

1.  sandbox.vue 初始化boxCore,  boxCore 初始化ActionManage
2.  `ActionManage`构造函数, 会初始化 `DragResize`, `highlight`, 以及初始化 鼠标事件(`down`, `move`, `leave`, `wheel`, `dblclick`)与键盘事件(第三方库(`keycon`)), **每个事件都接入消息发布, 方便以后拓展**

    1.  `down`: 负责管理 `select`
    2.  `move`, `leave`: 负责管理 `highlight`, 清空 `highlight`
    3.  `wheel`: 清空 `highlight`, 具体的wheel事件已经由mask负责
    4.  `dblclick`: 暴露出去, 为以后拓展
3.  `initActionEvent`: 初始化操作相关事件监听 \`before-select\`: 执行  `select` 事件, 其余事件都是向外暴露的事件

### 流程

#### select 流程

> 画布点击触发的选中(还有就是, 主动触发editorService.select的选中)
> `select`由 `actionManage`触发, `drag, resize...`由moveable触发
> `select`的目的就是为了重新生成`moveable`
> 涉及文件: `boxCore, actionManage, boxRenderer, box-highlight, targetShow, dragResize, drag-resize-helper`

1.  监听`mouseDown`事件, 清空所有`highlight`节点, 移除`mousemove`事件
2.  通过 `renderer` 的 `getElementFromPoint` 获取点击组件
3.  `emit('before-select', el)` 发布事件
4.  由于 core中 `on('before-select')`, 所以触发`core.select`方法
    1.  获取选择组件
    2.  调用 `renderer.select` 事件
    3.  `mask.setLayout(el)` 主要处理容器更换或者页面更换的情况
    4.  触发`actionManage.select` => `dr.clearSelectStatus()` => `dr.select(el)` => ==`dr.initMoveable(el)`==
    5.  `dragResizeHelper.updateShadowEl(el)` => `targetShadow.update(el)` => `targetShadow.updateEl(el)` => `targetShadow.el = el`=> 解析选中组件, 将选中元素的样式转化后赋值给 shadow元素, 这样, shadow就变成了与选中元素一样的大小与位置
    6.  `dragResizeHelper.getShadowEl()` 获取`shadow`元素 => `moveable.updateRect` 更新需要被`moveable`高亮的元素
    7.  触发`mask.observerIntersection(el)` 滚动到选中元素
5.  监听`mouseUp`事件

#### drag 流程

#### movebale 流程

1.  经过 `select` 流程时, 执行了 `dr.initMoveable(el)`方法, 初始化了`moveable`的各种方法
2.  `dr.initMoveable(el)`
    1.  `bindResizeEvent`: 大小变化
    2.  `bindDragEvent`: 拖拽
        1.  `dragStart`: `dragHelp`记录节点被改变前坐标`frameSnapShot`
        2.  `drag`:
            1.  判断是否在一个容器组件中悬浮超过`containerHighlightDuration`, 超过则给此容器添加`containerHighlightClassName`, 标记此容器为父亲, `delayedMarkContainer`类似防抖原理
            2.  `dragHelp.onDrag`, 计算目标节点的`top、left`, (改变前坐标`frameSnapShot` + 移动坐标 - margin)px, `暂时计算, dragend获取offset后转化为rem`
        3.  `dragEnd`:
            1.  删除`containerHighlightClassName`, 清空父元素标记
            2.  判断父元素poasition: `absolute`调用`update`; `relative`调用`sort`
            3.  通过`dragResizeHelper.getUpdatedElRect()`获取元素坐标, 此方法会计算 px 到 画布的px 所需要的值
                1.  `x * designWidth / runtimeWidth`
                2.  如更换父节点: ==原来的位置Offset + translate - 新父节点Offset==
            4.  `emit('update', {target, style})` (dr =>actionManage => core => editorService)
            5.  `editorService.update` => `updateHelper`(`dealText` 处理`q-text` )
    3.  `bindRotateEvent`: 旋转
    4.  `bindScaleEvent`: 缩放
3.  初始完成后, 后续操作(拖拽, 更新等等操作)执行 `updateMoveable`

### BoxDragResize

负责单选相关逻辑，拖拽、改变大小、旋转等行为是依赖于开源库Moveable实现的，这些行为并不是直接作用于组件本身，而是在蒙层上创建了一个跟组件同等大小的边框div，实际拖拽的是边框div，在拖拽过程中同步更新组件。
这个类的主要工作包括：

*   初始化组件操作边框，初始化moveable参数
*   更新moveable参数，比如增加了参考线、缩放了大小、表单改变了组件，都需要更新
*   接收moveable的回调函数，同步去更新实际组件的渲染

### BoxMultiDragResize

功能跟BoxDragResize类似，只是这个类是负责多选操作的，通过ctrl健选中多个组件，多选状态下不支持通过表单配置组件。

### BoxHighlight

在鼠标经过画布中的组件、或者鼠标经过组件目录树中的组件时，会触发组件高亮，高亮也是通过moveable实现的，这个类主要负责初始化moveable并管理高亮状态。

### MoveableOptionsManager

BoxDragResize、BoxMultiDragResize的父类，负责管理Moveable的配置

## TargetShadow

统一管理拖拽框(`drag`)和高亮框(`highlight`)，包括创建、更新、销毁。

1.  拖拽框(`drag`) 由 `DragResizeHelper`生成管理
2.  高亮框(`highlight`) 由 `BoxHighlight`生成管理

### 步骤

1.  选中或者拖拽元素, 会触发 `drag_el`的更新, `targetShadow.update`
2.  将target 的样式更新到 drag\_el上
3.  通过moveable更新 选中框

## DragResizeHelper

*   拖拽/改变大小等操作发生时，moveable会抛出各种状态事件，DragResizeHelper负责响应这些事件，对目标节点target和拖拽节点targetShadow进行修改；
*   其中目标节点是DragResizeHelper直接改的，targetShadow作为直接被操作的拖拽框，是调用moveableHelper改的；
*   有个特殊情况是流式布局下，moveableHelper不支持，targetShadow也是DragResizeHelper直接改的

