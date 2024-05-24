import { RouteRecordRaw } from 'vue-router';
import { LAYOUT } from '../base';

export const manageRoute: RouteRecordRaw = {
    path: '/backend/manage',
    component: LAYOUT,
    name: 'Manage',
    meta: {
        title: 'Manage',
        // hideBreadcrumb: true,
        // hideMenu: true,
        id: 'manage',
        pid: '0',
    },
    redirect: '/backend/manage/h5-manage',
    children: [
        {
            path: 'h5-manage',
            name: 'H5Manage',
            component: () => import('@/views/page-manage/h5-manage/index.vue'),
            meta: {
                title: 'h5项目管理',
                id: 'h5Manage',
                pid: 'manage',
            },
        },
        {
            path: 'backend-manage',
            name: 'BackendManage',
            component: () => import('@/views/page-manage/backend-manage/index.vue'),
            meta: {
                title: '后台项目管理',
                id: 'BackendManage',
                pid: 'manage',
            },
        }
    ],
};
