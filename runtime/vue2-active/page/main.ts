import { LowCodeRoot } from '@qimao/quantum-core';
import { getUrlParam, parseSchemas } from '@qimao/quantum-utils';
import Vue from 'vue';
import App from './App.vue';
import { getLocalConfig } from './utils';
import { requestFn } from './utils/http';
import * as componentExtra from '@q-front-npm/vue2-active-ui';
import * as component from '@qimao/quantum-ui-vue2';
import '@q-front-npm/vue2-active-ui/dist/components.css';
import '../hooks/reset.css';
import { DESIGN_WIDTH } from '@qimao/quantum-schemas';
if (import.meta.env.PROD) {
    import('@qimao/quantum-ui-vue2/dist/es/style/index.css');
}

const components:any = {
    'button': 'button',
    ...component,
    'container': component.Container,
    'page': component.Page,
    ...componentExtra,
};

const dsls = (getUrlParam('localPreview') ? getLocalConfig() : [parseSchemas(window.PAGE_JSON)]) || [];

const app = new LowCodeRoot({
    ua: window.navigator.userAgent,
    config: dsls[0] || {},
    curPage: getUrlParam('page'),
    request: requestFn,
    designWidth: DESIGN_WIDTH,
});

Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));
// app.setDesignWidth(app.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : dsls[0].designWidth || 720);
app.setDesignWidth(dsls[0].designWidth || 720);
window.appInstance = app;
new Vue({
    render: (h) => h(App),
    provide: {
        app,
    },
    el: '#app',
});
