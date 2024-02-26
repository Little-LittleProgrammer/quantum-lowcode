import { LowCodeRoot } from '@qimao/quantum-core';
import Vue from 'vue';
import App from './App.vue';
import * as componentExtra from '@q-front-npm/vue2-active-ui';
import * as component from '@qimao/quantum-ui-vue2';
import '@q-front-npm/vue2-active-ui/dist/components.css';

const app = new LowCodeRoot({});
const components:any = {
    ...component,
    'container': component.Container,
    'page': component.Page,
    ...componentExtra,
};
console.log('components', components);
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
