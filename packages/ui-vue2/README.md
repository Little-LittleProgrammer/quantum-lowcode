# 组件开发
1. 复制一份demo代码

```
q-demo               
├─ src               
│  ├─ demo.vue       // 组件主代码
│  ├─ event.ts       // 暴露出来的事件
│  └─ formSchema.ts  // 表单配置
└─ index.ts     // 导出组件
```     

2. 开发组件
组件内有注入 app实例 [查看api](apps/quantum-docs/docs/api/schema/app.md)

3. 开发完成后, components.ts导出组件, config.ts导出配置