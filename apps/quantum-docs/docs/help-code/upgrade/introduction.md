# 介绍
## 目录结构
```
├── apps
│   ├── playground // 低代码后台
│   ├── quantum-docs // 文档
│── packages
│   ├── core // 核心库, 对节点操作、全局事件、数据进行统一管理
│   ├── data-source // 数据源
│   ├── editor // 编辑器
│   ├── sandbox // 画布
│   ├── schemas // 低代码schema声明协议
│   ├── utils // 工具库
│   ├── ui // 组件库
│── runtime // 运行时
│   ├── render-vue2 // 运行时渲染器 vue2
│   ├── render-vue3 // 运行时渲染器 vue3
│── package.json
```

## 原理介绍

## schema解析渲染
通过载入保存的 `lowcodeSchema`配置, 通过渲染器渲染页面, 容器和组件在配置中呈树状结构, 所以渲染页面时, 渲染器会递归配置, 从而渲染出页面所有组件

## 编辑器与runtime通讯
本质上是通过发布订阅类, 
1. 将 `onRuntimeReady` 方法注入到 `window` 的 `quantum` 中
2. 初始化时订阅`runtime-ready`的事件, 当`iframe`里的项目初始化完成时, 将触发`runtime-ready`事件, 拿到`runtime`配置的事件, 从而实现通讯
