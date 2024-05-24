# 功能

画布功能
1. 渲染runtime, 基于iframe加载传入进来的runtimeUrl
用于预览渲染结果
2. 

## 核心介绍

## BoxCore
- 负责统一对外接口，编辑器通过BoxCore传入runtime、添加/删除组件、缩放画布、更新参考线和标尺等；同时BoxCore也会对外抛出事件，比如组件选中、多选、高亮、更新，runtimeReady等。
- 管理三个核心类：BoxRender、BoxMask、ActionManager

## BoxRender
基于iframe加载传入进来的runtimeUrl，并支持增删改查组件。还提供了一个核心API：getElementsFromPoint，该API负责获取指定坐标下所有dom节点。

## BoxMask
mask是一个盖在画布区域的一个蒙层, 主要作用是隔绝鼠标事件, 避免组件本身的事件被触发, mask在滚动时和画布保持同步大小

## ActionManager
- 负责监听鼠标和键盘事件, 基于这些事件, 形成单选、多选、高亮行为. 主要监听的是蒙层上的鼠标事件, 通过boxRender.getElementsFromPoint计算获得鼠标下方的组件，实现事件监听和实际组件的解构。
- 向上负责跟 BoxCore 双向通信，提供接口供core调用，并向core抛出事件
- 向下管理BoxDragResize、BoxMultiDragResize、BoxHighlight这三个单选、多选、高亮类，让它们协同工作

### BoxDragResize
负责单选相关逻辑，拖拽、改变大小、旋转等行为是依赖于开源库Moveable实现的，这些行为并不是直接作用于组件本身，而是在蒙层上创建了一个跟组件同等大小的边框div，实际拖拽的是边框div，在拖拽过程中同步更新组件。
这个类的主要工作包括：

    - 初始化组件操作边框，初始化moveable参数
    - 更新moveable参数，比如增加了参考线、缩放了大小、表单改变了组件，都需要更新
    - 接收moveable的回调函数，同步去更新实际组件的渲染

#### MoveableOptionsManager
StageDragResize、StageMultiDragResize的父类，负责管理Moveable的配置

#### DragResizeHelper
- 拖拽/改变大小等操作发生时，moveable会抛出各种状态事件，DragResizeHelper负责响应这些事件，对目标节点target和拖拽节点targetShadow进行修改；
- 其中目标节点是DragResizeHelper直接改的，targetShadow作为直接被操作的拖拽框，是调用moveableHelper改的；
- 有个特殊情况是流式布局下，moveableHelper不支持，targetShadow也是DragResizeHelper直接改的


### BoxHighlight
在鼠标经过画布中的组件、或者鼠标经过组件目录树中的组件时，会触发组件高亮，高亮也是通过moveable实现的，这个类主要负责初始化moveable并管理高亮状态。

## TargetShadow
将选中的节点修正定位后，添加一个操作节点到蒙层上, 统一管理拖拽框和高亮框，目标节点的影子节点, 包括创建、更新、销毁。


