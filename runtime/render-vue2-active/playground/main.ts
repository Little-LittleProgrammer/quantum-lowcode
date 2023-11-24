import { LowCodeRoot } from '@qimao/quantum-core';
import Vue from 'vue';
import App from './App.vue';
// import * as components from '@q-front-npm/vue2-active-ui'

const app = new LowCodeRoot({});
const components:any = {
    'button': 'div'
};
Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);
window.appInstance = app;

new Vue({
    render: (h) => h(App),
    provide: {
        app
    },
    el: '#app'
});
