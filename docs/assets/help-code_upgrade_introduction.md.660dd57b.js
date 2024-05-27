import{_ as s,o as a,c as e,Q as n}from"./chunks/framework.7bfedb2b.js";const y=JSON.parse('{"title":"介绍","description":"","frontmatter":{},"headers":[],"relativePath":"help-code/upgrade/introduction.md","filePath":"help-code/upgrade/introduction.md","lastUpdated":1716776943000}'),l={name:"help-code/upgrade/introduction.md"},p=n(`<h1 id="介绍" tabindex="1">介绍 <a class="header-anchor" href="#介绍" aria-label="Permalink to &quot;介绍&quot;">​</a></h1><h2 id="目录结构" tabindex="1">目录结构 <a class="header-anchor" href="#目录结构" aria-label="Permalink to &quot;目录结构&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">├── apps</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── playground // 低代码后台</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── quantum-docs // 文档</span></span>
<span class="line"><span style="color:#e1e4e8;">│── packages</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── core // 核心库, 对节点操作、全局事件、数据进行统一管理</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── data-source // 数据源</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── editor // 编辑器</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── sandbox // 画布</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── schemas // 低代码schema声明协议</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── utils // 工具库</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── ui // 组件库</span></span>
<span class="line"><span style="color:#e1e4e8;">│── runtime // 运行时</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── render-vue2 // 运行时渲染器 vue2</span></span>
<span class="line"><span style="color:#e1e4e8;">│   ├── render-vue3 // 运行时渲染器 vue3</span></span>
<span class="line"><span style="color:#e1e4e8;">│── package.json</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">├── apps</span></span>
<span class="line"><span style="color:#24292e;">│   ├── playground // 低代码后台</span></span>
<span class="line"><span style="color:#24292e;">│   ├── quantum-docs // 文档</span></span>
<span class="line"><span style="color:#24292e;">│── packages</span></span>
<span class="line"><span style="color:#24292e;">│   ├── core // 核心库, 对节点操作、全局事件、数据进行统一管理</span></span>
<span class="line"><span style="color:#24292e;">│   ├── data-source // 数据源</span></span>
<span class="line"><span style="color:#24292e;">│   ├── editor // 编辑器</span></span>
<span class="line"><span style="color:#24292e;">│   ├── sandbox // 画布</span></span>
<span class="line"><span style="color:#24292e;">│   ├── schemas // 低代码schema声明协议</span></span>
<span class="line"><span style="color:#24292e;">│   ├── utils // 工具库</span></span>
<span class="line"><span style="color:#24292e;">│   ├── ui // 组件库</span></span>
<span class="line"><span style="color:#24292e;">│── runtime // 运行时</span></span>
<span class="line"><span style="color:#24292e;">│   ├── render-vue2 // 运行时渲染器 vue2</span></span>
<span class="line"><span style="color:#24292e;">│   ├── render-vue3 // 运行时渲染器 vue3</span></span>
<span class="line"><span style="color:#24292e;">│── package.json</span></span></code></pre></div><h2 id="原理介绍" tabindex="1">原理介绍 <a class="header-anchor" href="#原理介绍" aria-label="Permalink to &quot;原理介绍&quot;">​</a></h2><h2 id="schema解析渲染" tabindex="1">schema解析渲染 <a class="header-anchor" href="#schema解析渲染" aria-label="Permalink to &quot;schema解析渲染&quot;">​</a></h2><p>通过载入保存的 <code>lowcodeSchema</code>配置, 通过渲染器渲染页面, 容器和组件在配置中呈树状结构, 所以渲染页面时, 渲染器会递归配置, 从而渲染出页面所有组件</p><h2 id="编辑器与runtime通讯" tabindex="1">编辑器与runtime通讯 <a class="header-anchor" href="#编辑器与runtime通讯" aria-label="Permalink to &quot;编辑器与runtime通讯&quot;">​</a></h2><p>本质上是通过发布订阅类,</p><ol><li>将 <code>onRuntimeReady</code> 方法注入到 <code>window</code> 的 <code>quantum</code> 中</li><li>初始化时订阅<code>runtime-ready</code>的事件, 当<code>iframe</code>里的项目初始化完成时, 将触发<code>runtime-ready</code>事件, 拿到<code>runtime</code>配置的事件, 从而实现通讯</li></ol>`,9),o=[p];function c(t,r,i,d,u,h){return a(),e("div",null,o)}const _=s(l,[["render",c]]);export{y as __pageData,_ as default};
