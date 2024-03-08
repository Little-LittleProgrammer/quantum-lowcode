import { LowCodeRoot } from '@qimao/quantum-core';
import Vue from 'vue';
import App from './App.vue';
import * as componentExtra from '@q-front-npm/vue2-active-ui';
import * as component from '@qimao/quantum-ui-vue2';
import '@q-front-npm/vue2-active-ui/dist/components.css';
import '../hooks/reset.css';
if (import.meta.env.PROD) {
    import('@qimao/quantum-ui-vue2/dist/es/style/index.css');
}
const app = new LowCodeRoot({
    ua: `'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1`,
});
const components:any = {
    ...component,
    'container': component.Container,
    'page': component.Page,
    ...componentExtra,
};
console.log('components', components);
Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

app.setDesignWidth(app.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : 720);
window.appInstance = app;

new Vue({
    render: (h) => h(App),
    provide: {
        app,
    },
    el: '#app',
});
