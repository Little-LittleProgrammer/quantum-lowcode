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
mask是一个盖在画布区域的一个蒙层, 主要作用是隔绝鼠标事件, 避免组件事件被处罚, mask在滚动时和画布保持同步

## BoxHighlight
在鼠标经过画布中的组件、或者鼠标经过组件目录树中的组件时，会触发组件高亮，高亮也是通过moveable实现的，这个类主要负责初始化moveable并管理高亮状态。

## TargetShadow
统一管理拖拽框和高亮框，包括创建、更新、销毁。

