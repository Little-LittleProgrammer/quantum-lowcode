import { defineConfig, DefaultTheme } from 'vitepress';
import fs from 'fs'
import path from 'path'

const _antdCssStrTemp = fs.readFileSync(path.resolve('node_modules/@q-front-npm/shared/style/antd/base.scss'), 'utf-8').toString().split('// antdend')[0].match(/\$(.*);/g)!.join(',').replace(/;,/g, '",').replace(/;/g, '"').replace(/: /g, '": "').replace(/\$/g, '"');
const _antdCssData = JSON.parse('{' + _antdCssStrTemp + '}');

const _baseScssFile = "@import '@q-front-npm/shared/style/base/base.scss'; @import '@q-front-npm/shared/style/base/mixin.scss'; @import '../docs/.vitepress/theme/styles/custom.scss';";


export default defineConfig({
    base: '/',
    title: 'Vite-project',
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
        siteTitle: '七猫',
        nav: createNav(),
        sidebar: createSidebar(),
        lastUpdatedText: '最后更新时间',
        footer: {
            message: 'MIT Licensed',
            copyright: 'Copyright © qimao',
        },
        outlineTitle: '锚点',
        docFooter: {
            prev: '上一篇',
            next: '下一篇'
        },
        socialLinks: [
            { icon: 'github', link: 'https://codeup.aliyun.com/qimao/front/q-front-npm' }
        ],
        editLink: {
            text: '编辑此页',
            pattern: 'https://codeup.aliyun.com/qimao/front/q-front-npm/tree/master/docs/project-docs/docs/:path'
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
            link: '/help-code/standard/',
            items: [
                {
                    text: '规范',
                    link: '/help-code/standard/publish',
                },
                {
                    text: '开发',
                    link: '/help-code/develop/docs',
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
                link: '/help-code/start/introduction.md'
            }]
        }, {
            text: '规范',
            items: [{
                text: 'commit规范',
                link: '/help-code/standard/commit'
            }, {
                text: '* 版本与发版',
                link: '/help-code/standard/publish'
            }, {
                text: '代码规范',
                link: '/help-code/standard/lint'
            }, {
                text: '单元测试',
                link: '/help-code/standard/vitest'
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
