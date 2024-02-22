<template>
    <div @click="handlerClick" @change="handlerChange" >
        <p>hello world</p> 
        <p>{{ api }}  </p> 
        <p>count: {{ number }}  </p> 
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import type { ISchemasNode} from '@qimao/quantum-schemas';

import {useApp} from '../../hooks/use-app';
import { emit } from 'process';

export default defineComponent({
    props: { // 配置要传入的props, 与formSchema.ts配置对应
        config: { // 必须拥有, 用来接收 输入的schemaDsl
            type: Object as PropType<ISchemasNode>,
            default: () => ({}), 
        },
        api: {
            type: String,
            default: ''
        }
    },
    emits: ['click', 'change'],
    setup(props,{emit}) {
        const number = ref(0)
        /**
         * 将配置和需要暴露的方法传入
         * @return {app} 为root实例, 包含 请求(request), 全局数据与方法(dataSource), 其他组件信息与暴露数据等等
         */
        const {app, } = useApp({ 
            config: props.config,
            methods: {handlerExpose}
        });

        function handlerExpose() {
            console.log('handlerExpose');
            number.value++
            handlerApi()
        }

        /**
         * params?: Record<string, string>;
            data?: Record<string, any>;
            headers?: Record<string, string>;
            method?: Method;
         */
        async function handlerApi() {
            if (app && app.request) {
                const _res = await app.request({
                    url: props.api,
                    params: {
                        name: 'qimao',
                    },
                    data: {
                        name: 'qimao',
                    },
                    method: 'get',
                    headers: {}
                })
            }
            
        }

        function handlerClick(e) {
            emit('click', e)
        }
        function handlerChange(e) {
            emit('change', e)
        }
        return {
            number,
            handlerClick,
            handlerChange
        }
    },
});
</script>