
import { IMenuData } from '@q-front-npm/types/vue/router';

const _menus:IMenuData[] = [{
    auth_name: '编辑器',
    id: 2,
    pid: 0,
    path: '/backend/editor/editor-page?runtimePathType=vue2',
    path_type: 1,
}];

console.log('_menus', _menus);

export default _menus;
