import { IDataSourceSchema } from '@qimao/quantum-schemas';
import { FormConfig } from '../types';

const baseFormConfig: FormConfig = [
    {
        field: 'options',
        label: '基础信息',
        component: 'Divider',
    },
    {
        label: 'id',
        field: 'id',
        component: 'Text',
        ifShow: ({values, }) => values.id,
    },
    {
        label: '类型',
        field: 'type',
        component: 'Text',
        defaultValue: 'base',
    },
    {
        label: '名称',
        field: 'title',
        component: 'Input',
        required: true,
    },
    {
        label: '描述',
        field: 'description',
        component: 'Input',
    }
];

const httpFormConfig: FormConfig = [
    {
        field: 'autoFetch',
        label: '自动请求',
        component: 'Switch',
    },
    {
        field: 'responseOptions.dataPath',
        label: '数据路径',
        component: 'Input',
        helpMessage: '服务端返回数据所需数据的层级, 一般情况下是res.data',
    },
    {
        field: 'options',
        label: '请求设置',
        component: 'Divider',
    },
    {
        field: 'options.url',
        label: 'url',
        component: 'Input',
    },
    {
        field: 'options.method',
        label: 'Method',
        component: 'Select',
        componentProps: {
            options: [
                { label: 'GET', value: 'GET', },
                { label: 'POST', value: 'POST', },
                { label: 'PUT', value: 'PUT', },
                { label: 'DELETE', value: 'DELETE', }
            ],
        },
    },
    {
        field: 'options.headers',
        label: '请求头',
        component: 'KeyValue',
        helpMessage:
			'请求头, 例如: Authorization: Bearer token, 填写${dataSourceId:fieldId} 可动态设置请求参数',
    },
    {
        field: 'options.params',
        label: '参数',
        component: 'KeyValue',
        helpMessage:
			'请求参数, 例如: {id: 1}, 填写${dataSourceId:fieldId} 可动态设置请求参数',
    },
    {
        field: 'options.data',
        label: '请求体',
        component: 'KeyValue',
        helpMessage:
			'请求参数, 例如: {id: 1}, 填写${dataSourceId:fieldId} 可动态设置请求参数',
    }
];

function formatConfig(config: FormConfig): FormConfig {
    return [
        ...baseFormConfig,
        ...config,
        {
            field: 'options',
            label: '数据拓展',
            component: 'Divider',
        },
        {
            label: '数据定义',
            field: 'fields',
            component: 'DataSourceFields',
        },
        {
            label: '方法定义',
            field: 'methods',
            component: 'DataSourceMethods',
        },
        {
            label: '请求拦截器',
            field: 'beforeRequest',
            component: 'CodeEditor',
            ifShow: ({ values, }) => values.type === 'http',
            componentProps: {
                style: {height: '500px'}
            }
        },
        {
            label: '响应拦截器',
            field: 'afterResponse',
            component: 'CodeEditor',
            ifShow: ({ values, }) => values.type === 'http',
            componentProps: {
                style: {height: '500px'}
            }
        }
    ];
}

export function getFormConfig(
    type: string,
    configs: Record<string, FormConfig>
): FormConfig {
    switch (type) {
        case 'base':
            return formatConfig([]);
        case 'http':
            return formatConfig(httpFormConfig);
        default:
            return formatConfig(configs[type] || []);
    }
}

export function getFormValue(type: string, values: Partial<IDataSourceSchema>) {
    if (type !== 'http') {
        return values;
    }

    return {
        beforeRequest: `(options, context) => {
      /**
       * 用户可以直接编写函数，在原始接口调用之前，会运行该函数，将这个函数的返回值作为该数据源接口的入参
       *
       * options: HttpOptions
       *
       * interface HttpOptions {
       *  // 请求链接
       *  url: string;
       *  // query参数
       *  params?: Record<string, string>;
       *  // body数据
       *  data?: Record<string, any>;
       *  // 请求头
       *  headers?: Record<string, string>;
       *  // 请求方法 GET/POST
       *  method?: Method;
       * }
       *
       * context：上下文对象
       *
       * interface Content {
       *  app: ILowCodeRoot;
       *  dataSource: HttpDataSource;
       * }
       *
       * return: HttpOptions
       */
    
      // 此处的返回值会作为这个接口的入参
      return options;
    }`,
        afterResponse: `(response, context) => {
      /**
       * 用户可以直接编写函数，在原始接口返回之后，会运行该函数，将这个函数的返回值作为该数据源接口的返回
    
        * context：上下文对象
        *
        * interface Content {
        *  app: ILowCodeRoot;
        *  dataSource: HttpDataSource;
        * }
        *
        */
    
      // 此处的返回值会作为这个接口的返回值
      return response;
    }`,
        ...values,
    };
}
