# 原理介绍

## schema解析渲染
通过载入保存的 `lowcodeSchema`配置, 通过渲染器渲染页面, 容器和组件在配置中呈树状结构, 所以渲染页面时, 渲染器会递归配置, 从而渲染出页面所有组件

## 编辑器与runtime通讯
本质上是通过发布订阅类, 
1. 将 `onRuntimeReady` 方法注入到 `window` 的 `quantum` 中
2. 初始化时订阅`runtime-ready`的事件, 当`iframe`里的项目初始化完成时, 将触发`runtime-ready`事件, 拿到`runtime`配置的事件, 从而实现通讯
