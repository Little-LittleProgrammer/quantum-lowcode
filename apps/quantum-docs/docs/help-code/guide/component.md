# 组件开发标准

## 标准
- `Quantum` 低代码平台的组件开发没有开发标准, 可以任意进行开发
- 额外注入了 `app` 实例, 可以获得整个 `schemas` 的配置, 以及页面跳转, 组件联动等等的能力, 详细`API`请看[App](../../api/schema/app.md)
` const app = inject('app')`