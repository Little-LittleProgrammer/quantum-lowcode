import{_ as s,c as n,o as e,a8 as p}from"./chunks/framework.BrmF0WDH.js";const u=JSON.parse('{"title":"原理导览","description":"","frontmatter":{},"headers":[],"relativePath":"theory/introduction.md","filePath":"theory/introduction.md","lastUpdated":1777649372000}'),t={name:"theory/introduction.md"};function i(l,a,o,c,r,d){return e(),n("div",null,a[0]||(a[0]=[p(`<h1 id="原理导览" tabindex="1">原理导览 <a class="header-anchor" href="#原理导览" aria-label="Permalink to &quot;原理导览&quot;">​</a></h1><p>这组文档解释 Quantum 的内部工作方式，重点回答三个问题：</p><ol><li>Schema 如何被 Core 转成可运行的页面实例。</li><li>编辑器如何维护状态，并把增删改查同步到画布。</li><li>运行时、Sandbox、DataSource 如何协作完成所见即所得和数据驱动更新。</li></ol><h2 id="架构分层" tabindex="1">架构分层 <a class="header-anchor" href="#架构分层" aria-label="Permalink to &quot;架构分层&quot;">​</a></h2><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>应用层</span></span>
<span class="line"><span>├── apps/playground        编辑器演示应用</span></span>
<span class="line"><span>└── apps/quantum-docs      文档站点</span></span>
<span class="line"><span></span></span>
<span class="line"><span>编辑层</span></span>
<span class="line"><span>├── packages/editor        可视化编辑器 UI 和服务</span></span>
<span class="line"><span>└── packages/sandbox       iframe 画布、选中、拖拽、通信</span></span>
<span class="line"><span></span></span>
<span class="line"><span>运行层</span></span>
<span class="line"><span>├── runtime/vue2-active    Vue2 运行时</span></span>
<span class="line"><span>└── runtime/vue3-active    Vue3 运行时</span></span>
<span class="line"><span></span></span>
<span class="line"><span>核心层</span></span>
<span class="line"><span>├── packages/core          LowCodeRoot/Page/Node</span></span>
<span class="line"><span>├── packages/data-source   数据源与依赖触发</span></span>
<span class="line"><span>├── packages/schemas       Schema 类型和常量</span></span>
<span class="line"><span>└── packages/utils         树操作、发布订阅、样式转换等工具</span></span></code></pre></div><h2 id="核心数据流" tabindex="1">核心数据流 <a class="header-anchor" href="#核心数据流" aria-label="Permalink to &quot;核心数据流&quot;">​</a></h2><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>用户操作</span></span>
<span class="line"><span>  -&gt; EditorService 更新 Schema</span></span>
<span class="line"><span>  -&gt; Sandbox 通知 iframe runtime</span></span>
<span class="line"><span>  -&gt; Runtime 递归渲染组件</span></span>
<span class="line"><span>  -&gt; Core 编译节点属性、事件和条件</span></span>
<span class="line"><span>  -&gt; DataSource 收集依赖并在数据变化时触发更新</span></span></code></pre></div><h2 id="推荐阅读顺序" tabindex="1">推荐阅读顺序 <a class="header-anchor" href="#推荐阅读顺序" aria-label="Permalink to &quot;推荐阅读顺序&quot;">​</a></h2><ul><li><a href="./core.html">核心模型</a>：先理解 <code>LowCodeRoot</code>、<code>LowCodePage</code>、<code>LowCodeNode</code> 的职责。</li><li><a href="./editor.html">编辑器</a>：再看编辑器如何组织服务、状态和操作入口。</li><li><a href="./sandbox.html">画布</a>：理解 iframe、蒙层、拖拽和坐标换算。</li><li><a href="./data-source.html">数据源</a>：理解数据绑定、依赖收集和触发更新。</li></ul><h2 id="和-api-文档的关系" tabindex="1">和 API 文档的关系 <a class="header-anchor" href="#和-api-文档的关系" aria-label="Permalink to &quot;和 API 文档的关系&quot;">​</a></h2><p>API 文档描述“字段怎么写”，原理文档描述“字段为什么这样生效”。如果只是写 Schema，优先看 <a href="/api/schema/">低代码 Schema 协议</a>。如果要改编辑器、画布、运行时或数据源实现，再回到本组文档。</p>`,11)]))}const m=s(t,[["render",i]]);export{u as __pageData,m as default};
