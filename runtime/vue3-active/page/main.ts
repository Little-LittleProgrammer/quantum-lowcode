import { LowCodeRoot } from '@quantum-lowcode/core';
import { createApp } from 'vue';
import * as component from '@quantum-lowcode/ui';
import { requestFn } from './utils/http';
import { getUrlParam, parseSchemas } from '@quantum-lowcode/utils';
import { getLocalConfig } from './utils';
import App from './App.vue';
import '../hooks/reset.css';

import { DEFAULT_DESIGN_WIDTH } from '@quantum-lowcode/schemas';
if (import.meta.env.PROD) {
    import('@quantum-lowcode/ui/dist/es/style/index.css');
}
const components:any = {
    ...component,
    'container': component.Container,
    'page': component.Page
};

const dsls = (getUrlParam('localPreview') ? getLocalConfig() : [parseSchemas(window.PAGE_JSON)]) || [];

const app = new LowCodeRoot({
    ua: window.navigator.userAgent,
    config: dsls[0] || {},
    curPage: getUrlParam('page'),
    // request: requestFn,
    designWidth: DEFAULT_DESIGN_WIDTH
});
Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

app.setDesignWidth(dsls[0].designWidth || 720);
// app.setDesignWidth(app.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : dsls[0].designWidth || 720);
window.appInstance = app;

console.log('app', app);

const appVue = createApp(App);

appVue.provide('app', app);
appVue.mount('#app');
