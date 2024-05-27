import{_ as s,o as a,c as n,Q as p}from"./chunks/framework.7bfedb2b.js";const u=JSON.parse('{"title":"全局事件和数据源","description":"","frontmatter":{},"headers":[],"relativePath":"api/schema/datasource.md","filePath":"api/schema/datasource.md","lastUpdated":1716776943000}'),l={name:"api/schema/datasource.md"},o=p(`<h1 id="全局事件和数据源" tabindex="1">全局事件和数据源 <a class="header-anchor" href="#全局事件和数据源" aria-label="Permalink to &quot;全局事件和数据源&quot;">​</a></h1><p>配置全局事件和数据, 分为base和http</p><h2 id="配置" tabindex="1">配置 <a class="header-anchor" href="#配置" aria-label="Permalink to &quot;配置&quot;">​</a></h2><h3 id="全局数据定义" tabindex="1">全局数据定义 <a class="header-anchor" href="#全局数据定义" aria-label="Permalink to &quot;全局数据定义&quot;">​</a></h3><ol><li>代码配置</li></ol><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#E1E4E8;">{</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">type</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&#39;root&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">name</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&#39;active1&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">dataSources</span><span style="color:#E1E4E8;">: [{</span></span>
<span class="line"><span style="color:#E1E4E8;">      id: </span><span style="color:#9ECBFF;">&quot;code1&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 数据调用的唯一值字段</span></span>
<span class="line"><span style="color:#E1E4E8;">      type: </span><span style="color:#9ECBFF;">&quot;base&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// base or http</span></span>
<span class="line"><span style="color:#E1E4E8;">      title: </span><span style="color:#9ECBFF;">&quot;代码1&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 标题</span></span>
<span class="line"><span style="color:#E1E4E8;">      description: </span><span style="color:#9ECBFF;">&quot;代码1全局&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 描述            </span></span>
<span class="line"><span style="color:#E1E4E8;">      fields: [</span></span>
<span class="line"><span style="color:#E1E4E8;">          {</span></span>
<span class="line"><span style="color:#E1E4E8;">            name: </span><span style="color:#9ECBFF;">&#39;a1&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 数据调用的唯一值字段</span></span>
<span class="line"><span style="color:#E1E4E8;">            type: </span><span style="color:#9ECBFF;">&#39;string&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 类型</span></span>
<span class="line"><span style="color:#E1E4E8;">            title: </span><span style="color:#9ECBFF;">&#39;a1&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 标题</span></span>
<span class="line"><span style="color:#E1E4E8;">            description: </span><span style="color:#9ECBFF;">&#39;a1&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 描述  </span></span>
<span class="line"><span style="color:#E1E4E8;">            defaultValue: </span><span style="color:#9ECBFF;">&#39;test测试&#39;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 默认值</span></span>
<span class="line"><span style="color:#E1E4E8;">          }</span></span>
<span class="line"><span style="color:#E1E4E8;">      ],</span></span>
<span class="line"><span style="color:#E1E4E8;">    }],</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">{</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">type</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&#39;root&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">name</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&#39;active1&#39;</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">dataSources</span><span style="color:#24292E;">: [{</span></span>
<span class="line"><span style="color:#24292E;">      id: </span><span style="color:#032F62;">&quot;code1&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 数据调用的唯一值字段</span></span>
<span class="line"><span style="color:#24292E;">      type: </span><span style="color:#032F62;">&quot;base&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// base or http</span></span>
<span class="line"><span style="color:#24292E;">      title: </span><span style="color:#032F62;">&quot;代码1&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 标题</span></span>
<span class="line"><span style="color:#24292E;">      description: </span><span style="color:#032F62;">&quot;代码1全局&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 描述            </span></span>
<span class="line"><span style="color:#24292E;">      fields: [</span></span>
<span class="line"><span style="color:#24292E;">          {</span></span>
<span class="line"><span style="color:#24292E;">            name: </span><span style="color:#032F62;">&#39;a1&#39;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 数据调用的唯一值字段</span></span>
<span class="line"><span style="color:#24292E;">            type: </span><span style="color:#032F62;">&#39;string&#39;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 类型</span></span>
<span class="line"><span style="color:#24292E;">            title: </span><span style="color:#032F62;">&#39;a1&#39;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 标题</span></span>
<span class="line"><span style="color:#24292E;">            description: </span><span style="color:#032F62;">&#39;a1&#39;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 描述  </span></span>
<span class="line"><span style="color:#24292E;">            defaultValue: </span><span style="color:#032F62;">&#39;test测试&#39;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 默认值</span></span>
<span class="line"><span style="color:#24292E;">          }</span></span>
<span class="line"><span style="color:#24292E;">      ],</span></span>
<span class="line"><span style="color:#24292E;">    }],</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre></div><ol start="2"><li>操作配置</li></ol><h3 id="全局方法定义" tabindex="1">全局方法定义 <a class="header-anchor" href="#全局方法定义" aria-label="Permalink to &quot;全局方法定义&quot;">​</a></h3><h4 id="base" tabindex="1">base <a class="header-anchor" href="#base" aria-label="Permalink to &quot;base&quot;">​</a></h4><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#E1E4E8;">{</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">type</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&#39;root&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">name</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&#39;active1&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">dataSources</span><span style="color:#E1E4E8;">: [{</span></span>
<span class="line"><span style="color:#E1E4E8;">        id: </span><span style="color:#9ECBFF;">&quot;code1&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 数据调用的唯一值字段</span></span>
<span class="line"><span style="color:#E1E4E8;">        type: </span><span style="color:#9ECBFF;">&quot;base&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// base or http</span></span>
<span class="line"><span style="color:#E1E4E8;">        title: </span><span style="color:#9ECBFF;">&quot;代码1&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 标题</span></span>
<span class="line"><span style="color:#E1E4E8;">        description: </span><span style="color:#9ECBFF;">&quot;代码1全局&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        methods: [{</span></span>
<span class="line"><span style="color:#E1E4E8;">            name: </span><span style="color:#9ECBFF;">&quot;方法1&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 标题</span></span>
<span class="line"><span style="color:#E1E4E8;">            description: </span><span style="color:#9ECBFF;">&quot;方法1&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 描述        </span></span>
<span class="line"><span style="color:#E1E4E8;">            timing: </span><span style="color:#9ECBFF;">&quot;beforeInit&quot;</span><span style="color:#E1E4E8;">, </span><span style="color:#6A737D;">// 调用时机, 不填则需触发</span></span>
<span class="line"><span style="color:#E1E4E8;">            params: [{ </span><span style="color:#6A737D;">// 参数定义</span></span>
<span class="line"><span style="color:#E1E4E8;">                name: </span><span style="color:#9ECBFF;">&quot;p1&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">                extra: </span><span style="color:#9ECBFF;">&quot;p1&quot;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">                type: </span><span style="color:#9ECBFF;">&quot;number&quot;</span></span>
<span class="line"><span style="color:#E1E4E8;">            }],</span></span>
<span class="line"><span style="color:#E1E4E8;">            </span><span style="color:#B392F0;">content</span><span style="color:#E1E4E8;">: ({ </span><span style="color:#FFAB70;">params</span><span style="color:#E1E4E8;">, </span><span style="color:#FFAB70;">dataSource</span><span style="color:#E1E4E8;">, </span><span style="color:#FFAB70;">app</span><span style="color:#E1E4E8;"> }) </span><span style="color:#F97583;">=&gt;</span><span style="color:#E1E4E8;"> {</span></span>
<span class="line"><span style="color:#E1E4E8;">                console.</span><span style="color:#B392F0;">log</span><span style="color:#E1E4E8;">(paraps.p1)</span></span>
<span class="line"><span style="color:#E1E4E8;">            }</span></span>
<span class="line"><span style="color:#E1E4E8;">        }]</span></span>
<span class="line"><span style="color:#E1E4E8;">    }],</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">{</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">type</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&#39;root&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">name</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&#39;active1&#39;</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">dataSources</span><span style="color:#24292E;">: [{</span></span>
<span class="line"><span style="color:#24292E;">        id: </span><span style="color:#032F62;">&quot;code1&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 数据调用的唯一值字段</span></span>
<span class="line"><span style="color:#24292E;">        type: </span><span style="color:#032F62;">&quot;base&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// base or http</span></span>
<span class="line"><span style="color:#24292E;">        title: </span><span style="color:#032F62;">&quot;代码1&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 标题</span></span>
<span class="line"><span style="color:#24292E;">        description: </span><span style="color:#032F62;">&quot;代码1全局&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        methods: [{</span></span>
<span class="line"><span style="color:#24292E;">            name: </span><span style="color:#032F62;">&quot;方法1&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 标题</span></span>
<span class="line"><span style="color:#24292E;">            description: </span><span style="color:#032F62;">&quot;方法1&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 描述        </span></span>
<span class="line"><span style="color:#24292E;">            timing: </span><span style="color:#032F62;">&quot;beforeInit&quot;</span><span style="color:#24292E;">, </span><span style="color:#6A737D;">// 调用时机, 不填则需触发</span></span>
<span class="line"><span style="color:#24292E;">            params: [{ </span><span style="color:#6A737D;">// 参数定义</span></span>
<span class="line"><span style="color:#24292E;">                name: </span><span style="color:#032F62;">&quot;p1&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">                extra: </span><span style="color:#032F62;">&quot;p1&quot;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">                type: </span><span style="color:#032F62;">&quot;number&quot;</span></span>
<span class="line"><span style="color:#24292E;">            }],</span></span>
<span class="line"><span style="color:#24292E;">            </span><span style="color:#6F42C1;">content</span><span style="color:#24292E;">: ({ </span><span style="color:#E36209;">params</span><span style="color:#24292E;">, </span><span style="color:#E36209;">dataSource</span><span style="color:#24292E;">, </span><span style="color:#E36209;">app</span><span style="color:#24292E;"> }) </span><span style="color:#D73A49;">=&gt;</span><span style="color:#24292E;"> {</span></span>
<span class="line"><span style="color:#24292E;">                console.</span><span style="color:#6F42C1;">log</span><span style="color:#24292E;">(paraps.p1)</span></span>
<span class="line"><span style="color:#24292E;">            }</span></span>
<span class="line"><span style="color:#24292E;">        }]</span></span>
<span class="line"><span style="color:#24292E;">    }],</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre></div><h2 id="调用" tabindex="1">调用 <a class="header-anchor" href="#调用" aria-label="Permalink to &quot;调用&quot;">​</a></h2><h3 id="数据调用" tabindex="1">数据调用 <a class="header-anchor" href="#数据调用" aria-label="Permalink to &quot;数据调用&quot;">​</a></h3><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki github-dark vp-code-dark"><code><span class="line"><span style="color:#E1E4E8;">{</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">type</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&#39;root&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">name</span><span style="color:#E1E4E8;">: </span><span style="color:#9ECBFF;">&#39;active1&#39;</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">dataSources</span><span style="color:#E1E4E8;">: [{</span></span>
<span class="line"><span style="color:#E1E4E8;">        </span><span style="color:#6A737D;">// 同上</span></span>
<span class="line"><span style="color:#E1E4E8;">    }],</span></span>
<span class="line"><span style="color:#E1E4E8;">    </span><span style="color:#B392F0;">children</span><span style="color:#E1E4E8;">: [{</span></span>
<span class="line"><span style="color:#E1E4E8;">        type: </span><span style="color:#9ECBFF;">&#39;page1&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        field: </span><span style="color:#9ECBFF;">&#39;page1&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">        children: [{</span></span>
<span class="line"><span style="color:#E1E4E8;">            field: </span><span style="color:#9ECBFF;">&#39;input1&#39;</span><span style="color:#E1E4E8;">,</span></span>
<span class="line"><span style="color:#E1E4E8;">            component: </span><span style="color:#9ECBFF;">&#39;Input&#39;</span><span style="color:#E1E4E8;">, </span></span>
<span class="line"><span style="color:#E1E4E8;">            componentProps: {</span></span>
<span class="line"><span style="color:#E1E4E8;">                value: </span><span style="color:#9ECBFF;">&#39;\${code1.a1}&#39;</span><span style="color:#E1E4E8;"> </span><span style="color:#6A737D;">// 调用</span></span>
<span class="line"><span style="color:#E1E4E8;">            }</span></span>
<span class="line"><span style="color:#E1E4E8;">        }]</span></span>
<span class="line"><span style="color:#E1E4E8;">    }]</span></span>
<span class="line"><span style="color:#E1E4E8;">}</span></span></code></pre><pre class="shiki github-light vp-code-light"><code><span class="line"><span style="color:#24292E;">{</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">type</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&#39;root&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">name</span><span style="color:#24292E;">: </span><span style="color:#032F62;">&#39;active1&#39;</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">dataSources</span><span style="color:#24292E;">: [{</span></span>
<span class="line"><span style="color:#24292E;">        </span><span style="color:#6A737D;">// 同上</span></span>
<span class="line"><span style="color:#24292E;">    }],</span></span>
<span class="line"><span style="color:#24292E;">    </span><span style="color:#6F42C1;">children</span><span style="color:#24292E;">: [{</span></span>
<span class="line"><span style="color:#24292E;">        type: </span><span style="color:#032F62;">&#39;page1&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        field: </span><span style="color:#032F62;">&#39;page1&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">        children: [{</span></span>
<span class="line"><span style="color:#24292E;">            field: </span><span style="color:#032F62;">&#39;input1&#39;</span><span style="color:#24292E;">,</span></span>
<span class="line"><span style="color:#24292E;">            component: </span><span style="color:#032F62;">&#39;Input&#39;</span><span style="color:#24292E;">, </span></span>
<span class="line"><span style="color:#24292E;">            componentProps: {</span></span>
<span class="line"><span style="color:#24292E;">                value: </span><span style="color:#032F62;">&#39;\${code1.a1}&#39;</span><span style="color:#24292E;"> </span><span style="color:#6A737D;">// 调用</span></span>
<span class="line"><span style="color:#24292E;">            }</span></span>
<span class="line"><span style="color:#24292E;">        }]</span></span>
<span class="line"><span style="color:#24292E;">    }]</span></span>
<span class="line"><span style="color:#24292E;">}</span></span></code></pre></div><h2 id="api" tabindex="1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><p><code>setData(data, path)</code>: 设置数据, data数据, path数据路径</p>`,15),e=[o];function t(c,r,E,y,i,d){return a(),n("div",null,e)}const h=s(l,[["render",t]]);export{u as __pageData,h as default};
