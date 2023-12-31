import { LowCodeRoot } from '@qimao/quantum-core';
import { get_url_param, js_is_string, parseSchemas } from '@qimao/quantum-utils';
import Vue from 'vue';
import App from './App.vue';
import { getLocalConfig } from './utils';
import { requestFn } from './utils/http';
import Container from '../src/container/index.vue';
import * as component from '@q-front-npm/vue2-active-ui';
// import * as components from '@q-front-npm/vue2-active-ui'
import '@q-front-npm/vue2-active-ui/dist/components.css';

const components:any = {
    'button': 'button',
    img: 'img',
    container: Container,
    ...component,
};

const app = new LowCodeRoot({
    ua: window.navigator.userAgent,
    config: ((get_url_param('localPreview') ? getLocalConfig() : [parseSchemas(window.PAGE_JSON)]) || [])[0] || {},
    curPage: get_url_param('page'),
    request: requestFn,
});

Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);

new Vue({
    render: (h) => h(App),
    provide: {
        app,
    },
    el: '#app',
});
