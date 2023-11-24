import Theme from 'vitepress/theme'
import HighlightCode from '../components/highlight-code.vue'
import CodeVoew from '../components/code-view.vue'
import {createPinia} from 'pinia';

import '@q-front-npm/shared/style/antd/antd.scss';
import '@q-front-npm/shared/style/base/index.scss';
import './styles/var.css';
import './styles/reset.css'


export default {
    ...Theme,
    async enhanceApp(ctx) {
        Theme.enhanceApp(ctx)
        ctx.app.component('CodeView', CodeVoew)
        ctx.app.component('HighlightCode', HighlightCode)
        const store = createPinia()
        ctx.app.use(store)
        console.log(import.meta)
        if (!import.meta.env.SSR) {
            import("ant-design-vue").then(module => {
                ctx.app.use(module.Input)
                ctx.app.use(module.Button)
                ctx.app.use(module.Card)
            })
        }
      }
  };