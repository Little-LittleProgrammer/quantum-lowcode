import { LowCodeRoot } from '@qimao/quantum-core';
import { getUrlParam, parseSchemas } from '@qimao/quantum-utils';
import Vue from 'vue';
import App from './App.vue';
import { getLocalConfig } from './utils';
import { requestFn } from './utils/http';
import * as component from '@q-front-npm/vue2-active-ui';
// import * as components from '@q-front-npm/vue2-active-ui'
import '@q-front-npm/vue2-active-ui/dist/components.css';

const components:any = {
    'button': 'button',
    img: 'img',
    ...component,
};

const app = new LowCodeRoot({
    ua: window.navigator.userAgent,
    config: ((getUrlParam('localPreview') ? getLocalConfig() : [parseSchemas(window.PAGE_JSON)]) || [])[0] || {},
    curPage: getUrlParam('page'),
    request: requestFn,
});

Object.keys(components).forEach((type: string) => app.registerComponent(type.toLowerCase(), components[type]));
app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);
window.appInstance = app;
new Vue({
    render: (h) => h(App),
    provide: {
        app,
    },
    el: '#app',
});
