import { createApp } from 'vue';
// import { register_sentry_vue } from '@quantum-design-configs/vite-sentry/project';
import {setup_store} from '@/store';
import { router, setup_router } from '@/router';
import { register_glob_comp } from './antd';
import { setup_outer_guard } from './router/setup-router';
import App from './App.vue';
import 'dayjs/locale/zh-cn';
import { setup_project_conf } from '@quantum-design/vue3-antd-pc-ui';
import setting from './enums/projectEnum';
import {install_monaco} from './monaco';
// import '@quantum-design/vue3-pc-ui/dist/es/style/index.css';
// import '@quantum-design/vue3-antd-pc-ui/dist/es/style/index.css';

if (import.meta.env.PROD) {
    import('@quantum-lowcode/editor/dist/quantum-editor.css');
}

// 时间组件中文
// dayjs.locale('zh-cn');

const app = createApp(App);
install_monaco();
// 安装store
setup_store(app);
setup_project_conf(setting);
// 安装router
setup_router(app);
// router-guard 安装路由守卫
setup_outer_guard(router);

// 安装 antd
register_glob_comp(app);


app.mount('#app');
