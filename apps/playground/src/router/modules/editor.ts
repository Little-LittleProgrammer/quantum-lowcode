import { RouteRecordRaw } from 'vue-router';
import { LAYOUT } from '../base';

export const editorRoute: RouteRecordRaw = {
    path: '/',
    component: LAYOUT,
    name: 'Editor',
    meta: {
        title: 'Editor',
        // hideBreadcrumb: true,
        // hideMenu: true,
        id: 'editor',
        pid: '0',
    },
    redirect: '/editor-page?runtimePathType=vue2',
    children: [
        {
            path: 'editor-page',
            name: 'QEditor',
            component: () => import('@/views/editor/index.vue'),
            meta: {
                title: '编辑器',
                id: 'editorPage',
                pid: 'editor',
            },
        }
    ],
};
