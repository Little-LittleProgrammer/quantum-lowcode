import { defineConfig, DefaultTheme } from 'vitepress';
import fs from 'fs'
import path from 'path'

const antdCssStrTemp = (fs.readFileSync(path.resolve('node_modules/@quantum-design/styles/base/base.scss'), 'utf-8').toString().split('// antdend')[0].match(/\$(.*);/g) || []).join(',').replace(/;,/g, '",').replace(/;/g, '"').replace(/: /g, '": "').replace(/\$/g, '"');
const _antdCssData = JSON.parse('{' + antdCssStrTemp + '}');

const _baseScssFile = "@use '@quantum-design/styles/base/base.scss' as *; @use '@quantum-design/styles/base/mixin.scss' as *; @use '../docs/.vitepress/theme/styles/custom.scss' as *;";



export default defineConfig({
    base: '/quantum-lowcode/docs/',
    title: 'Quantum Editor',
    lang: 'zh-CN',
    description: '一个开箱即用的前端框架',
    head: [['link', { rel: 'icon', href: '/logo.png' }]],
    lastUpdated: true,
    ignoreDeadLinks: true,
    outDir: '../dist',
    markdown: {
        anchor: {
            tabIndex:1
        }
    },
    themeConfig: {
        logo: '/logo.png',
        siteTitle: 'Quantum',
        nav: createNav(),
        sidebar: createSidebar(),
        lastUpdatedText: '最后更新时间',
        footer: {
            message: 'MIT Licensed',
            copyright: 'Copyright © quantum',
        },
        outlineTitle: '锚点',
        docFooter: {
            prev: '上一篇',
            next: '下一篇'
        },
        socialLinks: [
            { icon: 'github', link: 'https://codeup.aliyun.com/quantum/front/quantum-lowcode/tree/main' }
        ],
        editLink: {
            text: '编辑此页',
            pattern: 'https://codeup.aliyun.com/quantum/front/quantum-lowcode/tree/main/apps/quantum-docs/docs/:path'
        }
    },
    vite: {
        base: '/',
        css: {
            preprocessorOptions: {
                less: {
                    javascriptEnabled: true,
                    modifyVars: _antdCssData
                },
                scss: {
                    additionalData: _baseScssFile
                }
            }
        },
        server: {
            host: true,
            port: 9090
        }
    }
})

function createNav(): DefaultTheme.NavItem[] {
    return [
        {
            text: '新人上手',
            link: '/onboarding/index.md',
        },
        {
            text: '开发手册',
            link: '/help-code/guide/introduction.md',
            items: [
                {
                    text: '指南',
                    link: '/help-code/guide/introduction.md',
                },
                {
                    text: '进阶指南',
                    link: '/help-code/upgrade/introduction.md',
                }
            ],
        },
        {
            text: 'api',
            link: '/api/schema/',
            items: [
                {
                    text: 'schemas协议',
                    link: '/api/schema/',
                }
            ],
        },
        {
            text: '原理',
            link: '/theory/introduction.md',
            items: [
                {
                    text: '介绍',
                    link: '/theory/introduction.md'
                }
            ]
        }
    ]
}

function createSidebar(): DefaultTheme.Sidebar {
    return {
        '/onboarding/': [{
            text: '新人上手',
            items: [{
                text: '阅读地图',
                link: '/onboarding/index.md'
            }, {
                text: '00 - 新人30分钟了解项目精髓',
                link: '/onboarding/00-新人30分钟了解项目精髓/index.md'
            }, {
                text: '01 - 总览',
                link: '/onboarding/01-总览/index.md'
            }, {
                text: '02 - Schema 与核心数据模型',
                link: '/onboarding/02-Schema与核心数据模型/index.md'
            }, {
                text: '03 - Editor 编辑器状态流',
                link: '/onboarding/03-Editor编辑器状态流/index.md'
            }, {
                text: '04 - Sandbox 画布与交互',
                link: '/onboarding/04-Sandbox画布与交互/index.md'
            }, {
                text: '05 - DataSource 数据驱动',
                link: '/onboarding/05-DataSource数据驱动/index.md'
            }, {
                text: '06 - Runtime 渲染与组件机制',
                link: '/onboarding/06-Runtime渲染与组件机制/index.md'
            }, {
                text: '07 - 扩展点与新人落地建议',
                link: '/onboarding/07-扩展点与新人落地建议/index.md'
            }]
        }],
        '/': [{
            text: '指南',
            items: [{
                text: '介绍',
                link: '/help-code/guide/introduction.md'
            }, {
                text: '快速开始',
                link: '/help-code/guide/index.md'
            }, {
                text: '基础概念',
                link: '/help-code/guide/conception.md'
            }, {
                text: '组件开发',
                link: '/help-code/guide/component.md'
            }]
        }, {
            text: '进阶指南',
            items: [{
                text: '介绍',
                link: '/help-code/upgrade/introduction.md'
            }, {
                text: 'app',
                link: '/help-code/upgrade/app.md'
            }, {
                text: '画布',
                link: '/help-code/upgrade/sandbox.md'
            }, {
                text: '编辑器',
                link: '/help-code/upgrade/editor.md'
            }, {
                text: '二次开发',
                link: '/help-code/upgrade/sec.md'
            }]
        }, {
            text: '开发',
            items: [{
                text: '文档',
                link: '/help-code/develop/docs'
            }, {
                text: '项目',
                link: '/help-code/develop/project'
            }, {
                text: '云效流水线',
                link: '/help-code/develop/flow'
            }]
        }],
        '/api/': [{
            text: 'schemas协议',
            items: [{
                text: '协议',
                link: '/api/schema/index.md'
            }, {
                text: 'app实例',
                link: '/api/schema/app.md'
            }, {
                text: '全局数据',
                link: '/api/schema/datasource.md'
            }]
        }],
        '/theory/': [{
            text: '原理',
            items: [{
                text: '介绍',
                link: '/theory/introduction.md'
            }, {
                text: '核心',
                link: '/theory/core.md'
            }, {
                text: '编辑器',
                link: '/theory/editor.md'
            }, {
                text: '画布',
                link: '/theory/sandbox.md'
            }, {
                text: '数据',
                link: '/api/schema/data-source.md'
            }]
        }]
    }
}

// /**
//  * @type {(namespace:string,items:string[])=>string[]}
//  */
// function urlWrapper(namespace, items) {
//   return items.map((item) => namespace + item);
// }

// function getGuildNav() {
//   return urlWrapper('/guide', ['/']);
// }
