import { LowCodeRoot } from '@qimao/quantum-core';
import Vue from 'vue';
import App from './App.vue';
import Container from '../src/container/index.vue';
import * as component from '@q-front-npm/vue2-active-ui';
// import * as components from '@q-front-npm/vue2-active-ui'
import '@q-front-npm/vue2-active-ui/dist/components.css';

const app = new LowCodeRoot({});
const components:any = {
    'img': 'img',
    'button': 'button',
    container: Container,
    ...component,
};
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
