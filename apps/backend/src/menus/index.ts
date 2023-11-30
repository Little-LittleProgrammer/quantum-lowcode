
import { IMenuData } from '@q-front-npm/types/vue/router';

const _menus:IMenuData[] = [{
    auth_name: '项目管理',
    id: 1,
    pid: 0,
    path: '/backend/manage',
    path_type: 1,
    children: [{
        auth_name: 'h5项目管理',
        id: 3,
        pid: 1,
        path: '/backend/manage/h5-manage',
        path_type: 1
    }, {
        auth_name: 'backend项目管理',
        id: 4,
        pid: 1,
        path: '/backend/manage/backend-manage',
        path_type: 1
    }]
}, {
    auth_name: '编辑器',
    id: 2,
    pid: 0,
    path: '/backend/editor',
    path_type: 1
}];

console.log('_menus', _menus);

export default _menus;
