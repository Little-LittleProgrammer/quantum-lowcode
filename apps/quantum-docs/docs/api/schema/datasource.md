# 全局事件和数据源
配置全局事件和数据, 分为base和http

## 配置
### 全局数据定义
1. 代码配置
```ts
{
    type: 'root',
    name: 'active1'
    dataSources: [{
      id: "code1", // 数据调用的唯一值字段
      type: "base", // base or http
      title: "代码1", // 标题
      description: "代码1全局", // 描述            
      fields: [
          {
            name: 'a1', // 数据调用的唯一值字段
            type: 'string', // 类型
            title: 'a1', // 标题
            description: 'a1', // 描述  
            defaultValue: 'test测试', // 默认值
          }
      ],
    }],
}
```
2. 操作配置

### 全局方法定义
#### base
```ts
{
    type: 'root',
    name: 'active1'
    dataSources: [{
        id: "code1", // 数据调用的唯一值字段
        type: "base", // base or http
        title: "代码1", // 标题
        description: "代码1全局",
        methods: [{
            name: "方法1", // 标题
            description: "方法1", // 描述        
            timing: "beforeInit", // 调用时机, 不填则需触发
            params: [{ // 参数定义
                name: "p1",
                extra: "p1",
                type: "number"
            }],
            content: ({ params, dataSource, app }) => {
                console.log(paraps.p1)
            }
        }]
    }],
}
```

## 调用

### 数据调用
```ts
{
    type: 'root',
    name: 'active1'
    dataSources: [{
        // 同上
    }],
    children: [{
        type: 'page1',
        field: 'page1',
        children: [{
            field: 'input1',
            component: 'Input', 
            componentProps: {
                value: '${code1.a1}' // 调用
            }
        }]
    }]
}
```

## API

`setData(data, path)`: 设置数据, data数据, path数据路径