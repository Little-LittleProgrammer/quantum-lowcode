# 功能

画布功能
1. 渲染runtime, 基于iframe加载传入进来的runtimeUrl
用于预览渲染结果

## 核心介绍

### boxRender
基于iframe加载传入进来的runtimeUrl，并支持增删改查组件。还提供了一个核心API：getElementsFromPoint，该API负责获取指定坐标下所有dom节点。


