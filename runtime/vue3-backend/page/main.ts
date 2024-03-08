import { LowCodeRoot } from '@qimao/quantum-core';
import { createApp } from 'vue';
import * as components from '@qimao/quantum-ui';
import { requestFn } from './utils/http';
import { getUrlParam, parseSchemas } from '@qimao/quantum-utils';
import { getLocalConfig } from './utils';
import App from './App.vue';
import { DESIGN_WIDTH } from '@qimao/quantum-schemas';
if (import.meta.env.PROD) {
    import('@qimao/quantum-ui/dist/es/style/index.css');
}

const dsls = (getUrlParam('localPreview') ? getLocalConfig() : [parseSchemas(window.PAGE_JSON)]) || [];

const app = new LowCodeRoot({
    ua: window.navigator.userAgent,
    config: dsls[0] || {},
    curPage: getUrlParam('page'),
    request: requestFn,
    designWidth: DESIGN_WIDTH,
});
Object.keys(components).forEach((type: string) => app.registerComponent(type.toLowerCase(), components[type]));

app.setDesignWidth(dsls[0].designWidth || 720);
// app.setDesignWidth(app.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : dsls[0].designWidth || 720);
window.appInstance = app;

const appVue = createApp(App);

appVue.provide('app', app);
appVue.mount('#app');
