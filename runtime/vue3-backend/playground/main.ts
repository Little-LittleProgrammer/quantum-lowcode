import { LowCodeRoot } from '@quantum-lowcode/core';
import { createApp } from 'vue';
import * as components from '@quantum-lowcode/ui';
import App from './App.vue';
if (import.meta.env.PROD) {
    import('@quantum-lowcode/ui/dist/es/style/index.css');
}

const app = new LowCodeRoot({});
Object.keys(components).forEach((type: string) => app.registerComponent(type.toLowerCase(), components[type]));

app.setDesignWidth(app.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : 720);
const appVue = createApp(App);

window.appInstance = app;

appVue.provide('app', app);
appVue.mount('#app');
