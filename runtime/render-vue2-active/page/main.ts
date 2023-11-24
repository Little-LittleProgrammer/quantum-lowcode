import { LowCodeRoot } from '@qimao/quantum-core';
import { get_url_param } from '@qimao/quantum-utils';
import Vue from 'vue';
import { getLocalConfig } from './utils';

const app = new LowCodeRoot({
    config: ((get_url_param('localPreview') ? getLocalConfig() : window.lowCodeSchemas) || [])[0] || {},
    curPage: get_url_param('page')
});

Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);

new Vue({
    render: (h) => h(App),
    provide: {
        app
    },
    el: '#app'
});
