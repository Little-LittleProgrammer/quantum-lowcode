import { LowCodeRoot } from '@quantum-lowcode/core';
import { createApp } from 'vue';
import * as component from '@quantum-lowcode/ui';
import App from './App.vue';
import '../hooks/reset.css';

if (import.meta.env.PROD) {
    import('@quantum-lowcode/ui/dist/es/style/index.css');
}

console.log('component', component);

const components:any = {
    ...component,
    'container': component.Container,
    'page': component.Page
};

const app = new LowCodeRoot({
    ua: `'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1`,
    platform: 'editor'
});
Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

app.setDesignWidth(app.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : 720);
const appVue = createApp(App);

window.appInstance = app;

appVue.provide('app', app);
appVue.mount('#app');
