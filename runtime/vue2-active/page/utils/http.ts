import {createAxios} from '@quantum-design/http';
import { gContentTypeEnum } from '@quantum-design/shared/enums';
import type { IHttpOptions } from '@quantum-lowcode/schemas';

// const _requestNum = 0; // 请求数量
// const _requestPageUrl = ''; // 请求地址所在页面

const env = {
    apiUrl: 'https://test.test/',
    urlPrefix: '/api',
};
// const env = useViteEnv();

function custom_request(config: any) {
    return config;
}

function custom_request_error(error:any) {
}

function custom_response(res: any) {
    return res;
}

function custom_response_error(error:any) {
}

const defHttp = createAxios({
    customTransform: {
        customRequest: custom_request,
        customRequestError: custom_request_error,
        customResponse: custom_response,
        customResponseError: custom_response_error,
    },
    headers: {'Content-Type': gContentTypeEnum.JSON, },
    requestOptions: {
        // 接口地址
        apiUrl: env.apiUrl,
        // 接口拼接地址
        urlPrefix: env.urlPrefix,
    },
});

export function requestFn(options: IHttpOptions) {
    const {method = 'get', headers, url, params, } = options;
    return defHttp[(method.toLowerCase() as 'get')]({
        url,
        params,
        headers,
    });
}
