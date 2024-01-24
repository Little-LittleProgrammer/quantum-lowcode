import { LowCodeRoot } from '@qimao/quantum-core';
import { getUrlParam, parseSchemas } from '@qimao/quantum-utils';
import Vue from 'vue';
import App from './App.vue';
import { getLocalConfig } from './utils';
import { requestFn } from './utils/http';
import * as componentExtra from '@q-front-npm/vue2-active-ui';
import * as component from '@qimao/quantum-ui-vue2';
import '@q-front-npm/vue2-active-ui/dist/components.css';

const components:any = {
    'button': 'button',
    img: 'img',
    ...component,
    ...componentExtra,
};

const app = new LowCodeRoot({
    ua: window.navigator.userAgent,
    config: ((getUrlParam('localPreview') ? getLocalConfig() : [parseSchemas(window.PAGE_JSON)]) || [])[0] || {},
    curPage: getUrlParam('page'),
    request: requestFn,
});

Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));
app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);
window.appInstance = app;
new Vue({
    render: (h) => h(App),
    provide: {
        app,
    },
    el: '#app',
});
