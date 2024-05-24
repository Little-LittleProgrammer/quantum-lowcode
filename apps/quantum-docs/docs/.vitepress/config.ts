import { defineConfig, DefaultTheme } from 'vitepress';
import fs from 'fs'
import path from 'path'

const _antdCssStrTemp = fs.readFileSync(path.resolve('node_modules/@quantum-design/shared/style/antd/base.scss'), 'utf-8').toString().split('// antdend')[0].match(/\$(.*);/g)!.join(',').replace(/;,/g, '",').replace(/;/g, '"').replace(/: /g, '": "').replace(/\$/g, '"');
const _antdCssData = JSON.parse('{' + _antdCssStrTemp + '}');

const _baseScssFile = "@import '@quantum-design/shared/style/base/base.scss'; @import '@quantum-design/shared/style/base/mixin.scss'; @import '../docs/.vitepress/theme/styles/custom.scss';";


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
        }
    ]
}

function createSidebar(): DefaultTheme.Sidebar {
    return {
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
