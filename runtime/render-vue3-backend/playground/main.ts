import { LowCodeRoot } from '@qimao/quantum-core';
import { createApp } from 'vue';
import * as components from '@qimao/quantum-ui';
import App from './App.vue';

const app = new LowCodeRoot({});
Object.keys(components).forEach((type: string) => app.registerComponent(type.toLowerCase(), components[type]));

app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);

const appVue = createApp(App);

window.appInstance = app;

appVue.provide('app', app);
appVue.mount('#app');
