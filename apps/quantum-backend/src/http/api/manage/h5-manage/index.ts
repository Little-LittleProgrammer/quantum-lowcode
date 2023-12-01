import { defHttp } from '@/http/axios';
import { IH5ManageData, IH5ManageList } from './interface';

// 列表
export function apiGetH5ManageList() {
    return defHttp.get<Result<IH5ManageData>>({
        url: '/low-code/list',
    });
}

// 详情
export function apiGetH5ManageDetail(params: Record<'id', string>) {
    return defHttp.get<Result<IH5ManageList>>({
        url: '/low-code/detail',
        params,
    });
}

// 保存
export function apiSaveH5ManageProject(params: IH5ManageList) {
    return defHttp.post<Result>({
        url: params.id ? '/low-code/edit' : '/low-code/create',
        params,
    });
}

// 发布
export function apiPutH5ManageProject(params: Record<'id', string>) {
    return defHttp.put<Result>({
        url: '/low-code/publish',
        params,
    });
}
// 发布
export function apiPreviewH5ManageProject(params: Record<'id', string>) {
    return defHttp.get<Result>({
        url: '/low-code/priview',
        params,
    });
}
