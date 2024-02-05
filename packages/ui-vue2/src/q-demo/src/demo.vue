<template>
    <div>
        <p>hello world</p> 
        <p>{{ api }}  </p> 
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';

import type { ISchemasNode} from '@qimao/quantum-schemas';

import {useApp} from '../../hooks/use-app';

export default defineComponent({
    props: {
        config: { // 必须拥有, 用来接收 输入的schemaDsl
            type: Object as PropType<ISchemasNode>,
            default: () => ({}), 
        },
        api: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        const {app, } = useApp({
            config: props.config,
            methods: {handlerExpose}
        });

        function handlerExpose() {
            console.log('handlerExpose');
            handlerApi()
        }

        // function callOtherCompFunc() {
        //     // 调用 page组件 的 刷新页面方法
        //     // emit('node的id:组件的方法'), 因为组件可能多次
        //     app?.emit('page1:refresh')
        // }

        /**
         * params?: Record<string, string>;
            data?: Record<string, any>;
            headers?: Record<string, string>;
            method?: Method;
         */
        async function handlerApi() {
            if (app) {
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
    },
});
</script>