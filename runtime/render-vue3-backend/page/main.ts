import { LowCodeRoot } from '@qimao/quantum-core';
import { createApp } from 'vue';
import Form from '../src/component/form.vue';
import Table from '../src/component/table.vue';
import Container from '../src/container/index.vue';
import App from './App.vue';
import { requestFn } from './utils/http';
import { get_url_param } from '@qimao/quantum-utils';
import { getLocalConfig } from './utils';

const components: Record<string, any> = {
    form: Form,
    container: Container,
    table: Table,
};
const app = new LowCodeRoot({
    ua: window.navigator.userAgent,
    config: ((get_url_param('localPreview') ? getLocalConfig() : window.lowCodeSchemas) || [])[0] || {},
    curPage: get_url_param('page'),
    request: requestFn,
});
Object.keys(components).forEach((type: string) => app.registerComponent(type, components[type]));

app.setDesignWidth(window.document.documentElement.getBoundingClientRect().width);

const appVue = createApp(App);

appVue.provide('app', app);
appVue.mount('#app');
