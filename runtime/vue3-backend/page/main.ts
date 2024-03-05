import { LowCodeRoot } from '@qimao/quantum-core';
import { createApp } from 'vue';
import * as components from '@qimao/quantum-ui';
import { requestFn } from './utils/http';
import { getUrlParam } from '@qimao/quantum-utils';
import { getLocalConfig } from './utils';
import App from './App.vue';
if (import.meta.env.PROD) {
    import('@qimao/quantum-ui/dist/es/style/index.css');
}

const app = new LowCodeRoot({
    ua: window.navigator.userAgent,
    config: ((getUrlParam('localPreview') ? getLocalConfig() : window.PAGE_JSON) || [])[0] || {},
    curPage: getUrlParam('page'),
    request: requestFn,
});
Object.keys(components).forEach((type: string) => app.registerComponent(type.toLowerCase(), components[type]));

app.setDesignWidth(app.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : 375);

window.appInstance = app;

const appVue = createApp(App);

appVue.provide('app', app);
appVue.mount('#app');
