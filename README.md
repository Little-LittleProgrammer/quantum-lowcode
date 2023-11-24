# 概览
## 目的
1. 实现基本的、可拓展的、可被二次封装的、不依赖于框架的低代码平台
## 使用流程
1. 开发物料组件: 主要是指业务组件，比如图片组件、抽奖组件等,并配置为runtime的依赖,quantum-editor不提供物料组件
2. jsonSchemas配置: 根据自定的jsonSchemas协议,键入配置化的json,期间可实时预览
3. 预览与保存: 点击预览可预览最终的展示效果页面(不包含实时预览的一些监听器), 点击保存可将配置文件上传至服务器保存
# 功能
## 基本架构图
暂时无法在飞书文档外展示此内容
## 模块
1. core：数据模型(scheams)定义、存储与处理、以及事件状态的存储
  1. Node节点类: 
    1. 定义组件与容器节点, 
    2. 关联父亲节点、页面节点、根节点
  2. Page页面类: 
    1. 定义页面节点, 
    2. 可根据field获取Node节点信息, 
    3. 关联根节点
  3. Root根节点类: 
    1. 定义根节点
    2. 提供注册与注销全局组件方法
    3. 可根据field获取页面信息, 设置页面信息
    4. 请求方法属性
  4. 事件与全局状态管理类
```
// scheams最终协议, 七猫低代码协议标准,待定
// scheams格式例子
{
    type: 'root', // root | page | container
    children: [{
        type: 'page', // 防止某些活动需要两个页面
        field: 'page1',
        children: [{
            type: 'container',
            field: 'container1', // 唯一key, 会映射为HTMLelement的id
            style: (el) => {},
            children: [{
                field: 'button1',
                component: 'button',
                componentProps: {
                    // 传入组件的props
                }
            }]
        }, {
            field: 'slide',
            component: 'lunbo',
            style: {
                backgroundImage: 'https://cdn.xxxxx'
            }
            componentProps: (axios) => {
                return {
                    // 传入组件的props
                    onChange: () => {
                        axios.get('xxxx')
                    }
                }
            }
        }]
    }]
}
```
2. editor：可视化编辑器模块， 包括画布(实例化Sandbox)，布局, 服务
  1. 布局组件: 
    1. Framework: 布局组件
    2. Workspace: 工作区
    3. Sandbox: 画布
    4. Editor: 暴露出去的editor组件,
  2. Service store:全局的状态管理, 将全局暴露
    1. Editor: 关联core模块, 实现节点的设置读取更新
    2. Ui: 画布功能的样式管理类
  3. Hooks
    1. Use-service: 初始化service store
3. utils:：工具层
  1. Subscribe: 观察者类
4. Sandbox: 画布
  1. Box-core: 
    1. 管理boxrender
  2. Box-render: 
    1. 基于iframe加载传入进来的runtimeUrl,
    2. 挂载iframe
    3. iframe与编辑器交互事件注册方法
5. Runtime: 进行时
  1. 进行时, 与低代码引擎完全脱离, 通过sanbox画布,传递schemas
  2. 可视化页面需要在quantum-editor编辑器中搭建、渲染，通过模拟器所见即所得
  3. 以后要扩展低代码,只需要编写渲染器即可
    1. render-vue2-active: vue2活动渲染器, 
    2. render-vue3: vue3渲染器
6. UI：存放组件库、code-editor组件,供edit使用, 也可对外暴露供其他项目使用
7. backend: 搭建平台B端侧
  1. 管理平台: 管理低代码页面, 新增、编辑、复制、预览
  2. 低代码编辑器
8. Node层, 注入schemas
```
<!DOCTYPE html>
<html lang="zh-CN" id="JsHtmlRoot">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="https://cdn-front.qimao.com/global/static/images/favicon2022.ico" />
    <title><%= title %></title>
    <!-- 注入以下schemas, 注入到所有资源文件的最上面 -->
    <script type="module"> 
        window.lowCodeSchemas = {xxx}
    </script>
    <script type="module"></script>
    <link rel="modulepreload" as="script" crossorigin="" href="xxx">
  </head>
  <body>
    <div id="app">
    </div>
  </body>
</html>
```
# 总结
1. 低代码引擎: 
  1. 实现沙箱画布的创建与交互
  2. 实现jsonSchemas的管理
  3. 实现编辑器工作区
2. Runtime: 
  1. 接收jsonSchemas, 渲染最终页面
3. Bankend: 
  1. 实现管理与交互
## TODO
1. 事件(全局、局部)与数据源(全局、局部)存储与处理, 预计涉及模块(Core, data-source, editor)
2. 拖拽功能(editor, sandbox)
3. 容器组件

## 最终实现
1. 不依赖渐进式框架(vue, react)的低代码引擎, 可通过此引擎完成所有平台低代码的配置
2. 可供外部二次封装,将核心能力封装, 如需再次开发, 可直接下载npm包进行开发
3. 可实现前台后台h5项目的开发
4. 接入gpt, 可通过gpt的prompt方式提问生成schemas
