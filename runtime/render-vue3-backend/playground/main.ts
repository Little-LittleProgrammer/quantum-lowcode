import { LowCodeRoot } from '@qimao/quantum-core';
import { createApp } from 'vue';
import Form from '../src/component/form.vue';
import Table from '../src/component/table.vue';
import Conatiner from '../src/container/index.vue';
import App from './App.vue';

const app = new LowCodeRoot({});
const components = {
    form: Form,
    container: Conatiner,
};
Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);

const appVue = createApp(App);

appVue.provide('app', app);
appVue.mount('#app');
