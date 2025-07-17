## 1.1.3 (2025-07-17)

### Features

* 添加 对齐辅助线功能 ([1c135d3](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/1c135d3ea235930d5122e22c3991e3853cacbb63))

### Bug Fixes


## 1.1.2 (2025-07-14)

### Features

* **文档优化:** README.md 全面重写，新增项目架构图和开发指南 ([031808f](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/031808f9976c76e67a69e084a017c7d6905ab984))
* **条件显示:** 新增 `ifShow` 条件显示功能，支持基于数据源的动态组件显示控制
* **数据源管理:** 改进数据更新机制，确保Vue响应式系统能正确检测数据变化  
* **编辑器功能:** 沙箱高亮功能完善，优化组件操作流程
* **平台支持:** 新增 `editor` 平台类型，优化Vue2和Vue3运行时兼容性
* **条件判断:** 实现 `compliedConditions` 函数，支持多条件组合逻辑
* **响应式更新:** 数据变化时自动更新组件显示状态
* **代码质量:** TypeScript 类型完善，统一代码风格规范

### Bug Fixes

* **数据绑定:** 修复数据更新机制，直接在原有数据上更新提升性能
* **组件渲染:** 改进组件在不同平台下的渲染稳定性
* **错误处理:** 完善数据验证和错误提示机制
* **内存管理:** 改进组件销毁时的资源清理
* **类型定义:** 修复TypeScript类型定义问题，提升代码健壮性


## 1.1.1 (2024-05-24)

### Features

* 重构数据依赖触发逻辑, 借鉴vue的收集方式 ([1c135d3](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/1c135d3ea235930d5122e22c3991e3853cacbb63))

### Bug Fixes

* **core,editor,ui:** 修复缺陷 ([34e5a0f](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/34e5a0f07fefbdb4a23119b817560bcff5f00597))
* **editor-service:** 修复添加位置样式计算问题 ([8fd2e40](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/8fd2e408c97102c8cea9877b8495bbd1dd7e0d01))
* **editor:** 修改拖拽逻辑 ([4c5e6c6](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/4c5e6c64deac206c48b966948bb1660dcc89beb9))
* nothing ([774c3cc](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/774c3cc5e99872e382b1d92eb0ee9e5397929c6b))
* **sandbox:** 修复拖拽top计算缺陷 ([8a90a28](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/8a90a28643ead9ad793804eb9df3d539e978600b))
* **sandbox:** 修复px rem计算问题 ([4a0ee29](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/4a0ee296c1f954fbf3febb1b60596226b4c10b02))
* **ui-vue2:** 更改schemas ([0838f6b](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/0838f6b8dd29de022b951447e4110643353331ea))
* **utils,runtime:** 修复页面跳转缺陷 ([473643f](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/473643f8d9f8fc85641b96a4b5561077c9ff032f))

## 1.1.0 (2024-03-24)

### Features

* 补充 moveable, action-manage 功能 ([de9acfc](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/de9acfc306e8d18a099356478693906fb8ab21a6))
* 初始化经典模式 ([e4b6ade](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/e4b6adeaf12e5cca484d10a8b998e7224ff28fe1))
* 初始化数据源编辑器 ([427f138](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/427f1385fa6ca2f5910d0bb3d95d7d4927a47c78))
* 单节点拖拽初始化 ([392f48e](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/392f48ed2be595510a7f7641ba024db14d81da81))
* 多选节点拖拽初始化 ([4162779](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/4162779db75e536f7442891866ab53d79b251260))
* 更改文件名 ([3f988a8](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/3f988a8ef494274564cebf0c312b39a11d419564))
* 更改渲染器到组件库, 编辑器提到公共仓库 ([9542251](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/95422519afaeca74a38542cb34b8abfedc4822fb))
* 更新demo ([f20a446](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/f20a446c4c2da728e6b8be4e5b37ee9d0bee3cd9))
* 更新docs ([0d11c18](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/0d11c180826699204ac41d51803cb73ba8957bc3))
* 全局数据管理 ([a8e2ac2](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/a8e2ac2101cc6e92e4f979b6a768a1b87f3c3610))
* 全局数据管理 ([86b5023](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/86b5023a7c40cca9fbfc8738e3b7b8a1887bb2e6))
* 全局数据管理功能完成 80% ([bc95b84](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/bc95b849917a37c3eb4d17ca778d48a421b4c521))
* 提出公共节点类型到新包quantum-schemas ([d9103f6](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/d9103f692694f5150157a17b181c0f25e58ff35a))
* 添加业务向组件库组件 ([ec36e92](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/ec36e92777f8f40a5a620b6012192c9266055233))
* 拖拽功能,初始化 ([286d04c](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/286d04c16d0a4907bc9e63e4c47384eb1f55081f))
* 完成 代码模式下的 全局方法功能 ([efacb26](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/efacb26e35b9e79771d21d86a379d8326c758c95))
* 完成编辑器显示条件组件开发 ([1c09bd2](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/1c09bd2478d8b016d5c02013c95b4f3c0ef126a1))
* 完成全局数据处理, 只能处理每次root重新声明的情况, 还需处理更新情况 ([db436c1](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/db436c1b1577c6aae29993b841906160f4524e70))
* 完成组件联动事件 ([9cbc7a1](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/9cbc7a1dc5c863d7326a783411402e712c5e2a38))
* 完成组件schemas解析 ([12212f5](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/12212f5712f4343701d114e8979f43dd3f8e50d1))
* 完成h5适配 ([7969242](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/7969242568aa006e201fee7f51b9a723cb2c3fcf))
* 完成page-bar功能 ([2daaca9](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/2daaca9e78e4066cf316af288b7bcb2685ed110f))
* 完善 runtime功能 以及 打包 ([4f32176](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/4f3217694d3a36f18760bebe950583c19151baab))
* 完善功能; 更新代码格式; 增加打包功能 ([3cf9d30](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/3cf9d30a83de8448f7049c5b232be0d4d164b3be))
* 完善节点删除方法 ([c341516](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/c341516522b5b476e784b53834b66dd450c4a833))
* 完善经典模式功能 ([f1e07f2](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/f1e07f27bf6e08182b555dde906cacfb4bf463f4))
* 完善容器扩展功能 ([610eb65](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/610eb65474f0419ef34f03f277d3e63e3e4d4a19))
* 新增 设备切换方法 ([5347a1c](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/5347a1c62fa0b2e7032e0423df91a5b9dd6ae9cc))
* 新增 relative 排序 ([12cd969](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/12cd969bc8d6c0ce9ecf1f23e9a059b13d82d0a7))
* 新增一次性观察者事件 ([1ac2e4b](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/1ac2e4bceb238e8bffea7098f44d37830fffc3f2))
* 修改模版以及修复样式转换缺陷 ([fed4dac](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/fed4dac9d8da28a1f4a14e4c6a31a9ae086de5f7))
* 修改容器判断逻辑 ([2d0a853](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/2d0a853db71b180c5e2d58810c15b449a9c73083))
* 优化demo ([83af705](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/83af705cd10864596c2830b3c80887da561ca952))
* 增加 数据管理模块 ([3309ae6](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/3309ae6159093df3a71180411fb657247a3d1a65))
* 增加 遮罩容器组件 ([c984bd5](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/c984bd5e1f44a34ebe367e2628724f258fcd43ea))
* 增加编辑器拖拽排版功能 ([09b7311](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/09b73115003ab42353cc47b346533b2058db0272))
* 增加单节点拖拽所需enum ([0be9aec](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/0be9aec1f8c82cce6ed4626a19da44ee228fd607))
* 增加复制根据鼠标坐标计算 ([cd4cd36](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/cd4cd36929d22d769a9a628369bde444f15cf854))
* 增加富文本px适配功能 ([e8c5e0c](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/e8c5e0c14a67e35025cce92486fc1693778700a5))
* 增加画布改变选中框改变 ([09733dd](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/09733dd590e044b4646053d5a02a0d75a9ddb28c))
* 增加活动覆盖功能 ([edfac09](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/edfac0982912e93e34810954baf89629ec31bd5b))
* 增加基础组件 ([03e35b0](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/03e35b05b86a874e3b62bc338cb7cc7fbede8b8e))
* 增加可选全局数据组件 ([d35da5c](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/d35da5ce66f40506b1c80bac9ac95a2446e1f4e6))
* 增加历史操作记录 undo redo ([5c22142](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/5c2214255d82f16e20a6d83029deb0e8a76bc868))
* 增加蒙层组件配置 ([b37e576](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/b37e5760cac2649784d85daf1ce927fa7e6cf25b))
* 增加数据源方法操作以及层级展示,组件库建设等等 ([e6d667f](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/e6d667f43b9ff600fd3699a65dfe27668eeca7bb))
* 增加缩放功能 ([a682028](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/a682028e2eda6edb17ca0f8e9bc37acc2e9a585f))
* 增加显示配置功能 - 50% ([837fa6d](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/837fa6d0b2e2d71dfceeb94aba3a154f530611a3))
* 增加样式自定义 ([327be18](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/327be18806e400f4d0bb7fec14a5843830cb6b8c))
* 增加页面更改方法 ([a6caf1d](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/a6caf1d4ded14dcb0cdceb6f698cba515052fc8d))
* 增加页面监听功能 ([4dd3cb4](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/4dd3cb44769ee93029ebcc9dc3c01a960abfa334))
* 增加组件联动功能以及组件生命周期事件 ([64d2fa7](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/64d2fa74d20e4e6148151a5e8605d0145a8727ed))
* 增加key-value组件 ([79d7b40](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/79d7b40a072caf65fe78c67affa444024139e431))
* 增加layer下拉 ([3d53a70](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/3d53a70b13f9d50972f71f74108f70da7cec1e7c))
* 增加mask遮罩, 阻断渲染器事件, 为后续节点操作做准备 ([096ccba](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/096ccbafae26f5e89529ff1c3face2a2f7659c22))
* 增加scroll to 元素属性配置 ([a247d60](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/a247d60c9fb82c15bf0cc07b31c588926a113949))
* 增加seo配置 ([4a06ebd](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/4a06ebdda3f126d2c1b731ebba391552fdc52dc2))
* 重构设计稿尺寸计算逻辑部分代码 ([6256a5a](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/6256a5a9565841a050ab0ffc689121a1abbb8e53))
* 重构设计图逻辑和更换cdn ([0849651](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/08496517b95ad48018a121fbc34456a47738148f))
* add 生命周期配置 ([625433c](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/625433cbf242e00dc23e03d044fe5c161e0da8b7))
* addvideo组件以及增加seo 场景 ([60c73dd](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/60c73dd72590bac870d367e62825e1da189cf8e6))
* **create-turbo:** apply official-starter transform ([d20f285](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/d20f2850457cb18fc16fa72af672ac4a21e26ab6))
* **create-turbo:** apply pnpm-eslint transform ([535b1cb](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/535b1cb7d1eb184cbaa6d7ddef4e23b1bd49a565))
* **create-turbo:** create basic ([b72007f](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/b72007f35d1773f6cd088287f894b022ebcd16cf))
* **data-source:** 完善http功能 ([d6d4812](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/d6d4812557b9bd7c35afd5a45681a74e6748cdac))
* datasource init ([f6efb47](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/f6efb47be2d2fdfec9c92147c5837c2a120e0564))
* **editor:** 优化编辑器拖拽逻辑 ([ed86db4](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/ed86db493f6bda48506966d5882fe394876c01c1))

### Bug Fixes

* 调配接口, 以及更改交互 ([0115f17](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/0115f177b51abd81437dfa1e06b351e80c23ab99))
* 更改爆粗 ([a2d90a3](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/a2d90a3fb26643c772b8a0a774ddb8655ad0a0f1))
* 更改别名错误 ([32f6760](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/32f6760e801550b824aff754e8e0b39ea91f4bdd))
* 更改布局管理方式 ([62b198d](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/62b198d34407f5f48412dc39d3155b07478645ac))
* 更改默认显示模式 ([61df44e](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/61df44e8c52cc426c0677ce7b185f9070662f3d1))
* 更改请求 ([fcddd61](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/fcddd61c1e897d3743105d0fdf4299783c45320a))
* 更改依赖 ([1225ff2](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/1225ff2ac9751e5f9829f0ef7551543a6470da96))
* 更改组件初始值 ([a63c44e](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/a63c44edd14f59f32ea890f213396a0bd0598b76))
* 更改cdn ([0a5b1ba](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/0a5b1bafdfe079db22e8f1468411e24166128b66))
* 更改cdn ([ee87c2e](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/ee87c2e4d78c91c5a991d041dfefb7132d8738b8))
* 更改playground ([60956b7](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/60956b729b6216ec69c7268456ae9a9f65035781))
* 更改test api ([795c086](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/795c086d810507fb0540cc6fa26431f011f265a3))
* 更新编辑器样式 ([52ec314](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/52ec314346045ee99331ebad3eed248ccd87f182))
* 更新runtime文件夹 ([684e551](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/684e551e7d73959ff063ab0d49b4964675e7fbe3))
* 还原schemas ([b501ffb](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/b501ffb34bb36879d45f855813ed8d795d3f2921))
* 去除接口调用 ([22089d9](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/22089d9ac87fc4a74b378a472e370048371bcaff))
* 删除组件 ([14aee81](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/14aee811dcc9c4bed49426d60fcc43b704366f10))
* 特殊处理boolean值 ([fdbb058](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/fdbb058bd8455baf77c468df086d2214594cec33))
* 修复初始化样式问题 ([bd133dd](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/bd133dd55783e92124a21fef537d8c5e6dd42141))
* 修复弹窗 ([65f13ad](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/65f13adc176422a3f7bfa61378d620e152663f36))
* 修复滚动缺陷 ([976081d](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/976081d00e52e90fd9dd6d96b0abd30ea11390aa))
* 修复类型缺陷 ([4916972](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/4916972568d030baba76c8be00f2ecd20dd85e3a))
* 修复命名缺陷 ([cefa832](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/cefa832d966aead01a675d59202ed549de22937d))
* 修复命名缺陷 ([23e8bfe](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/23e8bfe186e651119ac7735a694fe84d19942579))
* 修复命名缺陷 ([e123790](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/e123790644e3d0a809744a408ba6d92b7945495e))
* 修复模版缺陷 ([115daf6](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/115daf69a2e45fef1cb96bcca2b6d0ac3927b097))
* 修复全局数据处理问题 ([7f50f93](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/7f50f9370ed08b4e3cb9106b95d973453b9ac5df))
* 修复缺陷 ([af3859d](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/af3859dbba6104208a2a07cb5bc91482e58d4210))
* 修复缺陷 ([b90bf4f](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/b90bf4fce1cdc0b753eea72321a76840a6a4f3c3))
* 修复缺陷 ([35661ab](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/35661ab9f9082a92b44327170d64f81fb6a7b825))
* 修复缺陷 ([0cad914](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/0cad914d8ccd9e3876ac0c77b58c01aa06e4bfd4))
* 修复缺陷 ([0893539](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/089353989fc74a38471089d2094ef27fad967737))
* 修复缺陷 ([baa0067](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/baa00676e89d78852aaf6dc3d9f09639174a1996))
* 修复缺陷 ([0608519](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/06085192c1a86e7ac30552ad3c5c21257da0353c))
* 修复位置计算缺陷 ([96b3698](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/96b3698f8a83424d522e3886a851e0de22836cdb))
* 修复样式缺陷 ([ba9af3f](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/ba9af3f258fd8c9ed200cf26a92bcafaada89162))
* 修复预览问题 ([b5843a4](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/b5843a42823a36b202a2ccb58afe35afbc2eb4ad))
* 修复坐标计算缺陷 ([9bba2d7](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/9bba2d75a26617e74944a121e4a2431155716146))
* 修复classic拖拽缺陷, 优化性能 ([cf22602](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/cf226025a45ddbce7016b6705265d13fa05aa589))
* 修复container判断方法 ([8bbb6d1](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/8bbb6d1d74cc76cef8e7781f573d997f6b5872b2))
* 修复subscribe订阅重复检测逻辑 ([3a8f89c](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/3a8f89ce2e8acd36dbddd60432144e4230ccaa42))
* 修复ua头缺陷 ([26d6790](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/26d679079d5d9ae7680c31fed3fe90ad9881dd19))
* 修改格式 ([70628f5](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/70628f516a3616b08a7a19b7b729ff356c037505))
* 修改类型 ([e5d9577](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/e5d95776a80e69c8bb10e8fd13ae2f93328f05e8))
* 修改逻辑 ([c55ae17](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/c55ae1783febb6ca52f38bec405fd01d792e2f8b))
* 修改文件base路径 ([5f4995e](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/5f4995ec4b88f1e626c9ef40c5b17fc0341e5de0))
* 修改cdn ([184b8a3](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/184b8a3ded2e175abc24fd95b843bd83cb925b06))
* 优化拖拽 ([f759757](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/f759757a8ec0935ea3266ee5ef49d4cec06122fc))
* 优化性能 ([d24f7d9](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/d24f7d9598264c6b83f82a3b2ff6cd2fbc6f0394))
* 优化样式编辑功能 ([fed1790](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/fed179040241486f539d9586968fbb7711ff249f))
* 优化自定义样式逻辑 ([f98c00c](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/f98c00c8aff314c3b813fecbcead0c21b78144c3))
* 增加案例 ([ba40818](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/ba4081889546dbbb0438e10e2d0f6971dd4c1f94))
* 增加必要传入 ([e9d8d86](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/e9d8d86610aa702fb226233c28d3ce09718b6f1e))
* 增加容错 ([276379d](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/276379d65d46eb4ac12a16fce03553c0d5e33730))
* 增加designWidth ([3b02d15](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/3b02d15af4d389fca376345f90e56b6f61ee93c1))
* 增加field判断 ([fac93e0](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/fac93e0a3999cb7ff41f30163d340fb64b7ff339))

## [1.0.0] (2023-11-24)

* http方法优化, 增加默认值 ([df66c9e](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/df66c9efd9815d5b28b19c0149cfd9d187c1f239))
* init datasource, complete 30% ([3643f9c](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/3643f9c3e8b6aa8255a3508be8a97e9cddc15c34))
* init project ([2b22127](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/2b221279e0b1a32fea9c141614752b8501d237eb))
* init show-input ([2957d78](https://github.com/Little-LittleProgrammer/quantum-lowcode/commit/2957d7818d9942ba856d4830c36b31d891ea80b7))
