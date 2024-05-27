import{_ as s,o as n,c as a,Q as p}from"./chunks/framework.7bfedb2b.js";const m=JSON.parse('{"title":"组件开发标准","description":"","frontmatter":{},"headers":[],"relativePath":"help-code/guide/component.md","filePath":"help-code/guide/component.md","lastUpdated":1716776943000}'),l={name:"help-code/guide/component.md"},o=p(`<h1 id="组件开发标准" tabindex="1">组件开发标准 <a class="header-anchor" href="#组件开发标准" aria-label="Permalink to &quot;组件开发标准&quot;">​</a></h1><h2 id="组件规范" tabindex="1">组件规范 <a class="header-anchor" href="#组件规范" aria-label="Permalink to &quot;组件规范&quot;">​</a></h2><ol><li>组件的基础形式，需要有四个文件 <ul><li>index.ts 入口文件, 引入导出以下文件</li><li>src/formSchema.ts: 表单配置描述, 组件需要的值,</li><li>src/event.ts: 定义暴露的事件</li><li>src/xxx.vue: 组件</li></ul></li><li>使用useApp可以获取 app 实例 <code>const {app} = useApp({config: props.config})</code> app实例请看 <a href="./../../api/schema/app.html">app</a></li><li>如果此组件为容器组件, 请在最外层元素增加class名 <code>quantum-ui-container</code>, 且导出组件命名以 <code>Container</code> 开头, 以便让编辑器识别</li><li>开发完成后, 请在<code>component.ts</code>将组件导出, 在<code>config.ts</code>中将配置导出, 具体导出以及命名方式请参考其他组件</li></ol><h2 id="目录结构" tabindex="1">目录结构 <a class="header-anchor" href="#目录结构" aria-label="Permalink to &quot;目录结构&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#e1e4e8;">q-xxx    // 组件         </span></span>
<span class="line"><span style="color:#e1e4e8;">├─ src               </span></span>
<span class="line"><span style="color:#e1e4e8;">│  ├─ event.ts       // 事件配置, 暴露出来实现组件联动</span></span>
<span class="line"><span style="color:#e1e4e8;">│  ├─ formSchema.ts  // 属性配置schema. 暴露给编辑器使用</span></span>
<span class="line"><span style="color:#e1e4e8;">│  └─ xxx.vue       </span></span>
<span class="line"><span style="color:#e1e4e8;">└─ index.ts          </span></span>
<span class="line"><span style="color:#e1e4e8;">component.ts // 将文件导出</span></span>
<span class="line"><span style="color:#e1e4e8;">config.ts // 将配置文件导出</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292e;">q-xxx    // 组件         </span></span>
<span class="line"><span style="color:#24292e;">├─ src               </span></span>
<span class="line"><span style="color:#24292e;">│  ├─ event.ts       // 事件配置, 暴露出来实现组件联动</span></span>
<span class="line"><span style="color:#24292e;">│  ├─ formSchema.ts  // 属性配置schema. 暴露给编辑器使用</span></span>
<span class="line"><span style="color:#24292e;">│  └─ xxx.vue       </span></span>
<span class="line"><span style="color:#24292e;">└─ index.ts          </span></span>
<span class="line"><span style="color:#24292e;">component.ts // 将文件导出</span></span>
<span class="line"><span style="color:#24292e;">config.ts // 将配置文件导出</span></span></code></pre></div><h2 id="案例-q-demo" tabindex="1">案例 q-demo <a class="header-anchor" href="#案例-q-demo" aria-label="Permalink to &quot;案例 q-demo&quot;">​</a></h2><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// q-demo</span></span>
<span class="line"><span style="color:#6A737D;">// src/event.ts</span></span>
<span class="line"><span style="color:#F97583;">export</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">default</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#6A737D;">// 需要暴露出去的事件, 例如给其他组件调用</span></span>
<span class="line"><span style="color:#E1E4E8;">    methods: [</span></span>
<span class="line"><span style="color:#E1E4E8;">        {</span></span>
<span class="line"><span style="color:#E1E4E8;">            label: </span><span style="color:#9ECBFF;">&#39;某个要暴露出去的事件&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            value: </span><span style="color:#9ECBFF;">&#39;handlerExpose&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        }</span></span>
<span class="line"><span style="color:#E1E4E8;">    ],</span></span>
<span class="line"><span style="color:#E1E4E8;">};</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">// q-demo</span></span>
<span class="line"><span style="color:#6A737D;">// src/event.ts</span></span>
<span class="line"><span style="color:#D73A49;">export</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">default</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6A737D;">// 需要暴露出去的事件, 例如给其他组件调用</span></span>
<span class="line"><span style="color:#24292E;">    methods: [</span></span>
<span class="line"><span style="color:#24292E;">        {</span></span>
<span class="line"><span style="color:#24292E;">            label: </span><span style="color:#032F62;">&#39;某个要暴露出去的事件&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">            value: </span><span style="color:#032F62;">&#39;handlerExpose&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        }</span></span>
<span class="line"><span style="color:#24292E;">    ],</span></span>
<span class="line"><span style="color:#24292E;">};</span></span></code></pre></div><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// src/formSchema.ts</span></span>
<span class="line"><span style="color:#F97583;">export</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">default</span><span style="color:#E1E4E8;"> [{</span></span>
<span class="line"><span style="color:#E1E4E8;">    field: </span><span style="color:#9ECBFF;">&#39;api&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    label: </span><span style="color:#9ECBFF;">&#39;请求接口&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    component: </span><span style="color:#9ECBFF;">&#39;Input&#39;</span><span style="color:#E1E4E8;">, </span></span>
<span class="line"><span style="color:#E1E4E8;">}, {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#6A737D;">// 此组件支持的事件, 需要在组件中emit出来,目的为配置化界面配置事件时可以选择一下事件</span></span>
<span class="line"><span style="color:#E1E4E8;">    field: </span><span style="color:#9ECBFF;">&#39;events&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    label: </span><span style="color:#9ECBFF;">&#39;事件&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    component: </span><span style="color:#9ECBFF;">&#39;EventSelect&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 事件必须填这个组件</span></span>
<span class="line"><span style="color:#E1E4E8;">    componentProps: {</span></span>
<span class="line"><span style="color:#E1E4E8;">        options: [{</span></span>
<span class="line"><span style="color:#E1E4E8;">            label: </span><span style="color:#9ECBFF;">&#39;点击&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            value: </span><span style="color:#9ECBFF;">&#39;onClick&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        }, {</span></span>
<span class="line"><span style="color:#E1E4E8;">            label: </span><span style="color:#9ECBFF;">&#39;change&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            value: </span><span style="color:#9ECBFF;">&#39;onChange&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        }],</span></span>
<span class="line"><span style="color:#E1E4E8;">    },</span></span>
<span class="line"><span style="color:#E1E4E8;">}];</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">// src/formSchema.ts</span></span>
<span class="line"><span style="color:#D73A49;">export</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">default</span><span style="color:#24292E;"> [{</span></span>
<span class="line"><span style="color:#24292E;">    field: </span><span style="color:#032F62;">&#39;api&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    label: </span><span style="color:#032F62;">&#39;请求接口&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    component: </span><span style="color:#032F62;">&#39;Input&#39;</span><span style="color:#24292E;">, </span></span>
<span class="line"><span style="color:#24292E;">}, {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6A737D;">// 此组件支持的事件, 需要在组件中emit出来,目的为配置化界面配置事件时可以选择一下事件</span></span>
<span class="line"><span style="color:#24292E;">    field: </span><span style="color:#032F62;">&#39;events&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    label: </span><span style="color:#032F62;">&#39;事件&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    component: </span><span style="color:#032F62;">&#39;EventSelect&#39;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 事件必须填这个组件</span></span>
<span class="line"><span style="color:#24292E;">    componentProps: {</span></span>
<span class="line"><span style="color:#24292E;">        options: [{</span></span>
<span class="line"><span style="color:#24292E;">            label: </span><span style="color:#032F62;">&#39;点击&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">            value: </span><span style="color:#032F62;">&#39;onClick&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        }, {</span></span>
<span class="line"><span style="color:#24292E;">            label: </span><span style="color:#032F62;">&#39;change&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">            value: </span><span style="color:#032F62;">&#39;onChange&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        }],</span></span>
<span class="line"><span style="color:#24292E;">    },</span></span>
<span class="line"><span style="color:#24292E;">}];</span></span></code></pre></div><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#E1E4E8;">// src/demo.vue</span></span>
<span class="line"><span style="color:#E1E4E8;">&lt;</span><span style="color:#85E89D;">template</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">    &lt;</span><span style="color:#85E89D;">div</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">@click</span><span style="color:#E1E4E8;">=</span><span style="color:#9ECBFF;">&quot;handlerClick&quot;</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">@change</span><span style="color:#E1E4E8;">=</span><span style="color:#9ECBFF;">&quot;handlerChange&quot;</span><span style="color:#E1E4E8;"> &gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">        &lt;</span><span style="color:#85E89D;">p</span><span style="color:#E1E4E8;">&gt;hello world&lt;/</span><span style="color:#85E89D;">p</span><span style="color:#E1E4E8;">&gt; </span></span>
<span class="line"><span style="color:#E1E4E8;">        &lt;</span><span style="color:#85E89D;">p</span><span style="color:#E1E4E8;">&gt;{{ api }}  &lt;/</span><span style="color:#85E89D;">p</span><span style="color:#E1E4E8;">&gt; </span></span>
<span class="line"><span style="color:#E1E4E8;">        &lt;</span><span style="color:#85E89D;">p</span><span style="color:#E1E4E8;">&gt;count: {{ number }}  &lt;/</span><span style="color:#85E89D;">p</span><span style="color:#E1E4E8;">&gt; </span></span>
<span class="line"><span style="color:#E1E4E8;">    &lt;/</span><span style="color:#85E89D;">div</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#E1E4E8;">&lt;/</span><span style="color:#85E89D;">template</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">&lt;</span><span style="color:#85E89D;">script</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">lang</span><span style="color:#E1E4E8;">=</span><span style="color:#9ECBFF;">&quot;ts&quot;</span><span style="color:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> { computed, defineComponent, PropType, ref } </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;vue&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">type</span><span style="color:#E1E4E8;"> { ISchemasNode} </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;@quantum-lowcode/schemas&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> {useApp} </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;../../hooks/use-app&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> { emit } </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;process&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">export</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">default</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">defineComponent</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">    props: { </span><span style="color:#6A737D;">// 配置要传入的props, 与formSchema.ts配置对应</span></span>
<span class="line"><span style="color:#E1E4E8;">        config: { </span><span style="color:#6A737D;">// 必须拥有, 用来接收 输入的schemaDsl</span></span>
<span class="line"><span style="color:#E1E4E8;">            type: Object </span><span style="color:#F97583;">as</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">PropType</span><span style="color:#E1E4E8;">&lt;</span><span style="color:#B392F0;">ISchemasNode</span><span style="color:#E1E4E8;">&gt;,</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#B392F0;">default</span><span style="color:#E1E4E8;">: () </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> ({}), </span></span>
<span class="line"><span style="color:#E1E4E8;">        },</span></span>
<span class="line"><span style="color:#E1E4E8;">        api: {</span></span>
<span class="line"><span style="color:#E1E4E8;">            type: String,</span></span>
<span class="line"><span style="color:#E1E4E8;">            default: </span><span style="color:#9ECBFF;">&#39;&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">        }</span></span>
<span class="line"><span style="color:#E1E4E8;">    },</span></span>
<span class="line"><span style="color:#E1E4E8;">    emits: [</span><span style="color:#9ECBFF;">&#39;click&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#9ECBFF;">&#39;change&#39;</span><span style="color:#E1E4E8;">],</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">setup</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">props</span><span style="color:#E1E4E8;">,{</span><span style="color:#FFAB70;">emit</span><span style="color:#E1E4E8;">}) {</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">number</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">ref</span><span style="color:#E1E4E8;">(</span><span style="color:#79B8FF;">0</span><span style="color:#E1E4E8;">)</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">/**</span></span>
<span class="line"><span style="color:#6A737D;">         * 将配置和需要暴露的方法传入</span></span>
<span class="line"><span style="color:#6A737D;">         * </span><span style="color:#F97583;">@return</span><span style="color:#6A737D;"> </span><span style="color:#B392F0;">{app}</span><span style="color:#6A737D;"> 为root实例, 包含 请求(request), 全局数据与方法(dataSource), 其他组件信息与暴露数据等等</span></span>
<span class="line"><span style="color:#6A737D;">         */</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> {</span><span style="color:#79B8FF;">app</span><span style="color:#E1E4E8;">, } </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">useApp</span><span style="color:#E1E4E8;">({ </span></span>
<span class="line"><span style="color:#E1E4E8;">            config: props.config,</span></span>
<span class="line"><span style="color:#E1E4E8;">            methods: {handlerExpose}</span></span>
<span class="line"><span style="color:#E1E4E8;">        });</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">handlerExpose</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#E1E4E8;">            console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;handlerExpose&#39;</span><span style="color:#E1E4E8;">);</span></span>
<span class="line"><span style="color:#E1E4E8;">            number.value</span><span style="color:#F97583;">++</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#B392F0;">handlerApi</span><span style="color:#E1E4E8;">()</span></span>
<span class="line"><span style="color:#E1E4E8;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">/**</span></span>
<span class="line"><span style="color:#6A737D;">         * params?: Record&lt;string, string&gt;;</span></span>
<span class="line"><span style="color:#6A737D;">            data?: Record&lt;string, any&gt;;</span></span>
<span class="line"><span style="color:#6A737D;">            headers?: Record&lt;string, string&gt;;</span></span>
<span class="line"><span style="color:#6A737D;">            method?: Method;</span></span>
<span class="line"><span style="color:#6A737D;">         */</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">async</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">handlerApi</span><span style="color:#E1E4E8;">() {</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#F97583;">if</span><span style="color:#E1E4E8;"> (app </span><span style="color:#F97583;">&amp;&amp;</span><span style="color:#E1E4E8;"> app.request) {</span></span>
<span class="line"><span style="color:#E1E4E8;">                </span><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">_res</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">await</span><span style="color:#E1E4E8;"> app.</span><span style="color:#B392F0;">request</span><span style="color:#E1E4E8;">({</span></span>
<span class="line"><span style="color:#E1E4E8;">                    url: props.api,</span></span>
<span class="line"><span style="color:#E1E4E8;">                    params: {</span></span>
<span class="line"><span style="color:#E1E4E8;">                        name: </span><span style="color:#9ECBFF;">&#39;quantum&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">                    },</span></span>
<span class="line"><span style="color:#E1E4E8;">                    data: {</span></span>
<span class="line"><span style="color:#E1E4E8;">                        name: </span><span style="color:#9ECBFF;">&#39;quantum&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">                    },</span></span>
<span class="line"><span style="color:#E1E4E8;">                    method: </span><span style="color:#9ECBFF;">&#39;get&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">                    headers: {}</span></span>
<span class="line"><span style="color:#E1E4E8;">                })</span></span>
<span class="line"><span style="color:#E1E4E8;">            }</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span></span>
<span class="line"><span style="color:#E1E4E8;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">handlerClick</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">e</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#B392F0;">emit</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;click&#39;</span><span style="color:#E1E4E8;">, e)</span></span>
<span class="line"><span style="color:#E1E4E8;">        }</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">function</span><span style="color:#E1E4E8;"> </span><span style="color:#B392F0;">handlerChange</span><span style="color:#E1E4E8;">(</span><span style="color:#FFAB70;">e</span><span style="color:#E1E4E8;">) {</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#B392F0;">emit</span><span style="color:#E1E4E8;">(</span><span style="color:#9ECBFF;">&#39;change&#39;</span><span style="color:#E1E4E8;">, e)</span></span>
<span class="line"><span style="color:#E1E4E8;">        }</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#F97583;">return</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">            number,</span></span>
<span class="line"><span style="color:#E1E4E8;">            handlerClick,</span></span>
<span class="line"><span style="color:#E1E4E8;">            handlerChange</span></span>
<span class="line"><span style="color:#E1E4E8;">        }</span></span>
<span class="line"><span style="color:#E1E4E8;">    },</span></span>
<span class="line"><span style="color:#E1E4E8;">});</span></span>
<span class="line"><span style="color:#E1E4E8;">&lt;/</span><span style="color:#85E89D;">script</span><span style="color:#E1E4E8;">&gt;</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">// src/demo.vue</span></span>
<span class="line"><span style="color:#24292E;">&lt;</span><span style="color:#22863A;">template</span><span style="color:#24292E;">&gt;</span></span>
<span class="line"><span style="color:#24292E;">    &lt;</span><span style="color:#22863A;">div</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">@click</span><span style="color:#24292E;">=</span><span style="color:#032F62;">&quot;handlerClick&quot;</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">@change</span><span style="color:#24292E;">=</span><span style="color:#032F62;">&quot;handlerChange&quot;</span><span style="color:#24292E;"> &gt;</span></span>
<span class="line"><span style="color:#24292E;">        &lt;</span><span style="color:#22863A;">p</span><span style="color:#24292E;">&gt;hello world&lt;/</span><span style="color:#22863A;">p</span><span style="color:#24292E;">&gt; </span></span>
<span class="line"><span style="color:#24292E;">        &lt;</span><span style="color:#22863A;">p</span><span style="color:#24292E;">&gt;{{ api }}  &lt;/</span><span style="color:#22863A;">p</span><span style="color:#24292E;">&gt; </span></span>
<span class="line"><span style="color:#24292E;">        &lt;</span><span style="color:#22863A;">p</span><span style="color:#24292E;">&gt;count: {{ number }}  &lt;/</span><span style="color:#22863A;">p</span><span style="color:#24292E;">&gt; </span></span>
<span class="line"><span style="color:#24292E;">    &lt;/</span><span style="color:#22863A;">div</span><span style="color:#24292E;">&gt;</span></span>
<span class="line"><span style="color:#24292E;">&lt;/</span><span style="color:#22863A;">template</span><span style="color:#24292E;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">&lt;</span><span style="color:#22863A;">script</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">lang</span><span style="color:#24292E;">=</span><span style="color:#032F62;">&quot;ts&quot;</span><span style="color:#24292E;">&gt;</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> { computed, defineComponent, PropType, ref } </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;vue&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">type</span><span style="color:#24292E;"> { ISchemasNode} </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;@quantum-lowcode/schemas&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> {useApp} </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;../../hooks/use-app&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> { emit } </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;process&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">export</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">default</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">defineComponent</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">    props: { </span><span style="color:#6A737D;">// 配置要传入的props, 与formSchema.ts配置对应</span></span>
<span class="line"><span style="color:#24292E;">        config: { </span><span style="color:#6A737D;">// 必须拥有, 用来接收 输入的schemaDsl</span></span>
<span class="line"><span style="color:#24292E;">            type: Object </span><span style="color:#D73A49;">as</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">PropType</span><span style="color:#24292E;">&lt;</span><span style="color:#6F42C1;">ISchemasNode</span><span style="color:#24292E;">&gt;,</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#6F42C1;">default</span><span style="color:#24292E;">: () </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> ({}), </span></span>
<span class="line"><span style="color:#24292E;">        },</span></span>
<span class="line"><span style="color:#24292E;">        api: {</span></span>
<span class="line"><span style="color:#24292E;">            type: String,</span></span>
<span class="line"><span style="color:#24292E;">            default: </span><span style="color:#032F62;">&#39;&#39;</span></span>
<span class="line"><span style="color:#24292E;">        }</span></span>
<span class="line"><span style="color:#24292E;">    },</span></span>
<span class="line"><span style="color:#24292E;">    emits: [</span><span style="color:#032F62;">&#39;click&#39;</span><span style="color:#24292E;">, </span><span style="color:#032F62;">&#39;change&#39;</span><span style="color:#24292E;">],</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">setup</span><span style="color:#24292E;">(</span><span style="color:#E36209;">props</span><span style="color:#24292E;">,{</span><span style="color:#E36209;">emit</span><span style="color:#24292E;">}) {</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">number</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">ref</span><span style="color:#24292E;">(</span><span style="color:#005CC5;">0</span><span style="color:#24292E;">)</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#6A737D;">/**</span></span>
<span class="line"><span style="color:#6A737D;">         * 将配置和需要暴露的方法传入</span></span>
<span class="line"><span style="color:#6A737D;">         * </span><span style="color:#D73A49;">@return</span><span style="color:#6A737D;"> </span><span style="color:#6F42C1;">{app}</span><span style="color:#6A737D;"> 为root实例, 包含 请求(request), 全局数据与方法(dataSource), 其他组件信息与暴露数据等等</span></span>
<span class="line"><span style="color:#6A737D;">         */</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">const</span><span style="color:#24292E;"> {</span><span style="color:#005CC5;">app</span><span style="color:#24292E;">, } </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">useApp</span><span style="color:#24292E;">({ </span></span>
<span class="line"><span style="color:#24292E;">            config: props.config,</span></span>
<span class="line"><span style="color:#24292E;">            methods: {handlerExpose}</span></span>
<span class="line"><span style="color:#24292E;">        });</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">handlerExpose</span><span style="color:#24292E;">() {</span></span>
<span class="line"><span style="color:#24292E;">            console.</span><span style="color:#6F42C1;">log</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;handlerExpose&#39;</span><span style="color:#24292E;">);</span></span>
<span class="line"><span style="color:#24292E;">            number.value</span><span style="color:#D73A49;">++</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#6F42C1;">handlerApi</span><span style="color:#24292E;">()</span></span>
<span class="line"><span style="color:#24292E;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#6A737D;">/**</span></span>
<span class="line"><span style="color:#6A737D;">         * params?: Record&lt;string, string&gt;;</span></span>
<span class="line"><span style="color:#6A737D;">            data?: Record&lt;string, any&gt;;</span></span>
<span class="line"><span style="color:#6A737D;">            headers?: Record&lt;string, string&gt;;</span></span>
<span class="line"><span style="color:#6A737D;">            method?: Method;</span></span>
<span class="line"><span style="color:#6A737D;">         */</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">async</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">handlerApi</span><span style="color:#24292E;">() {</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#D73A49;">if</span><span style="color:#24292E;"> (app </span><span style="color:#D73A49;">&amp;&amp;</span><span style="color:#24292E;"> app.request) {</span></span>
<span class="line"><span style="color:#24292E;">                </span><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">_res</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">await</span><span style="color:#24292E;"> app.</span><span style="color:#6F42C1;">request</span><span style="color:#24292E;">({</span></span>
<span class="line"><span style="color:#24292E;">                    url: props.api,</span></span>
<span class="line"><span style="color:#24292E;">                    params: {</span></span>
<span class="line"><span style="color:#24292E;">                        name: </span><span style="color:#032F62;">&#39;quantum&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">                    },</span></span>
<span class="line"><span style="color:#24292E;">                    data: {</span></span>
<span class="line"><span style="color:#24292E;">                        name: </span><span style="color:#032F62;">&#39;quantum&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">                    },</span></span>
<span class="line"><span style="color:#24292E;">                    method: </span><span style="color:#032F62;">&#39;get&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">                    headers: {}</span></span>
<span class="line"><span style="color:#24292E;">                })</span></span>
<span class="line"><span style="color:#24292E;">            }</span></span>
<span class="line"><span style="color:#24292E;">            </span></span>
<span class="line"><span style="color:#24292E;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">handlerClick</span><span style="color:#24292E;">(</span><span style="color:#E36209;">e</span><span style="color:#24292E;">) {</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#6F42C1;">emit</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;click&#39;</span><span style="color:#24292E;">, e)</span></span>
<span class="line"><span style="color:#24292E;">        }</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">function</span><span style="color:#24292E;"> </span><span style="color:#6F42C1;">handlerChange</span><span style="color:#24292E;">(</span><span style="color:#E36209;">e</span><span style="color:#24292E;">) {</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#6F42C1;">emit</span><span style="color:#24292E;">(</span><span style="color:#032F62;">&#39;change&#39;</span><span style="color:#24292E;">, e)</span></span>
<span class="line"><span style="color:#24292E;">        }</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#D73A49;">return</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">            number,</span></span>
<span class="line"><span style="color:#24292E;">            handlerClick,</span></span>
<span class="line"><span style="color:#24292E;">            handlerChange</span></span>
<span class="line"><span style="color:#24292E;">        }</span></span>
<span class="line"><span style="color:#24292E;">    },</span></span>
<span class="line"><span style="color:#24292E;">});</span></span>
<span class="line"><span style="color:#24292E;">&lt;/</span><span style="color:#22863A;">script</span><span style="color:#24292E;">&gt;</span></span></code></pre></div><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// index.ts</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> Demo </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;./src/page.vue&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#F97583;">export</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">default</span><span style="color:#E1E4E8;"> Demo;</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">// index.ts</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> Demo </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;./src/page.vue&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#D73A49;">export</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">default</span><span style="color:#24292E;"> Demo;</span></span></code></pre></div><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// components.ts</span></span>
<span class="line"><span style="color:#F97583;">...</span><span style="color:#E1E4E8;">.</span></span>
<span class="line"><span style="color:#F97583;">export</span><span style="color:#E1E4E8;"> {</span><span style="color:#F97583;">default</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">as</span><span style="color:#E1E4E8;"> Demo} </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;./q-demo&#39;</span><span style="color:#E1E4E8;">;</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">// components.ts</span></span>
<span class="line"><span style="color:#D73A49;">...</span><span style="color:#24292E;">.</span></span>
<span class="line"><span style="color:#D73A49;">export</span><span style="color:#24292E;"> {</span><span style="color:#D73A49;">default</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">as</span><span style="color:#24292E;"> Demo} </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;./q-demo&#39;</span><span style="color:#24292E;">;</span></span></code></pre></div><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#6A737D;">// config.ts</span></span>
<span class="line"><span style="color:#6A737D;">// schemas</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> demo </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;./q-demo/src/formSchema&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"><span style="color:#6A737D;">// events</span></span>
<span class="line"><span style="color:#F97583;">import</span><span style="color:#E1E4E8;"> demoEvents </span><span style="color:#F97583;">from</span><span style="color:#E1E4E8;"> </span><span style="color:#9ECBFF;">&#39;./q-demo/src/event&#39;</span><span style="color:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">formSchemas</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">...</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#9ECBFF;">&#39;Demo&#39;</span><span style="color:#E1E4E8;">: demo,</span><span style="color:#6A737D;">// 和组件导出名保持一致</span></span>
<span class="line"><span style="color:#E1E4E8;">};</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">const</span><span style="color:#E1E4E8;"> </span><span style="color:#79B8FF;">events</span><span style="color:#E1E4E8;"> </span><span style="color:#F97583;">=</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#F97583;">...</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#9ECBFF;">&#39;Demo&#39;</span><span style="color:#E1E4E8;">: demoEvents, </span><span style="color:#6A737D;">// 和组件导出名保持一致</span></span>
<span class="line"><span style="color:#E1E4E8;">};</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583;">export</span><span style="color:#E1E4E8;"> {formSchemas, events};</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#6A737D;">// config.ts</span></span>
<span class="line"><span style="color:#6A737D;">// schemas</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> demo </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;./q-demo/src/formSchema&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"><span style="color:#6A737D;">// events</span></span>
<span class="line"><span style="color:#D73A49;">import</span><span style="color:#24292E;"> demoEvents </span><span style="color:#D73A49;">from</span><span style="color:#24292E;"> </span><span style="color:#032F62;">&#39;./q-demo/src/event&#39;</span><span style="color:#24292E;">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">formSchemas</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">...</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#032F62;">&#39;Demo&#39;</span><span style="color:#24292E;">: demo,</span><span style="color:#6A737D;">// 和组件导出名保持一致</span></span>
<span class="line"><span style="color:#24292E;">};</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">const</span><span style="color:#24292E;"> </span><span style="color:#005CC5;">events</span><span style="color:#24292E;"> </span><span style="color:#D73A49;">=</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#D73A49;">...</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#032F62;">&#39;Demo&#39;</span><span style="color:#24292E;">: demoEvents, </span><span style="color:#6A737D;">// 和组件导出名保持一致</span></span>
<span class="line"><span style="color:#24292E;">};</span></span>
<span class="line"></span>
<span class="line"><span style="color:#D73A49;">export</span><span style="color:#24292E;"> {formSchemas, events};</span></span></code></pre></div>`,12),e=[o];function c(t,r,E,y,i,d){return n(),a("div",null,e)}const h=s(l,[["render",c]]);export{m as __pageData,h as default};
