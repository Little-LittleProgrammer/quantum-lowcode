import { LowCodeRoot } from '@quantum-lowcode/core';
import { getUrlParam, parseSchemas } from '@quantum-lowcode/utils';
import Vue from 'vue';
import App from './App.vue';
import { getLocalConfig } from './utils';
import { requestFn } from './utils/http';
import * as component from '@quantum-lowcode/ui-vue2';

import '../hooks/reset.css';
import { DEFAULT_DESIGN_WIDTH } from '@quantum-lowcode/schemas';
if (import.meta.env.PROD) {
    import('@quantum-lowcode/ui-vue2/dist/es/style/index.css');
}

const components:any = {
    'button': 'button',
    ...component,
    'container': component.Container,
    'page': component.Page
};

const dsls = (getUrlParam('localPreview') ? getLocalConfig() : [parseSchemas(window.PAGE_JSON)]) || [];

const app = new LowCodeRoot({
    ua: window.navigator.userAgent,
    config: dsls[0] || {},
    curPage: getUrlParam('page'),
    designWidth: DEFAULT_DESIGN_WIDTH
});

Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));
// app.setDesignWidth(app.env.isWeb ? window.document.documentElement.getBoundingClientRect().width : dsls[0].designWidth || 720);
app.setDesignWidth(dsls[0].designWidth || 720);
window.appInstance = app;
new Vue({
    render: (h) => h(App),
    provide: {
        app
    },
    el: '#app'
});
