import routerErrorData from '@/router/modules/error'; //  错误
import { createRouter, createWebHashHistory } from 'vue-router';
import { redirectRoute } from './modules/reload';
import { flat_multi_level_routes } from './utils';
import { App } from 'vue';
import { editorRoute } from './modules/editor';

let routerData = [
    editorRoute
];

// 添加error路由数据
routerData = [
    ...routerData,
    redirectRoute,
    ...routerErrorData // routerErrorData必须添加在最后
];

routerData = flat_multi_level_routes(routerData);

console.log(routerData);
// app router
const router = createRouter({
    history: createWebHashHistory(import.meta.env.VITE_BASE_PATH as string),
    routes: routerData,
    strict: true,
});

export function setup_router(app: App) {
    app.use(router);
}

export {
    router,
    routerData
};
