<template>
    <a-config-provider :locale="locale" :theme="getThemeMode">
        <div id="app" >
            <router-view></router-view>
            <component v-if="dynamicComponent" :is="dynamicComponent"></component>
        </div>
    </a-config-provider>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent} from 'vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { useMessage } from '@quantum-design/hooks/vue/use-message';
import { api_global_env } from '@/http/api/global';
import { router } from './router';
import { get_net_router } from '@quantum-design/vue3-antd-pc-ui';
import { useUserStore } from '@/store/modules/user';
import { useGlobalStore } from '@/store/modules/global';
import { useSysStore } from '@/store/modules/systemManage';
import { useProjectSetting } from '@quantum-design/vue3-antd-pc-ui';
import { IMenuData } from '@quantum-design/types/vue/router';
import { useThemeSetting } from '@/hooks/settings/use-theme-setting';

export default defineComponent({
    name: 'App',
    setup() {
        const locale = zhCN;
        const {createMessage} = useMessage();
        const userStore = useUserStore();
        const globalStore = useGlobalStore();
        const {getSearchButton} = useProjectSetting();
        const sysStore = useSysStore();
        const {getThemeMode} = useThemeSetting();
        let requestNum = 0;
        const get_global_env = () => { // 环境检测
            api_global_env().then(res => {
                if (res.code === 200) {
                    globalStore.set_environment_data(res.data);
                    userStore.username = res.data.username;
                    if (requestNum === 0) {
                        get_menus_data(); // 为了防止页面请求时，此接口还未返回环境数据env
                    }
                    requestNum++;
                } else if (res.code === 400) {
                    alert(`错误信息: ${res.msg}`);
                }
            });
            setTimeout(() => {
                get_global_env();
            }, 3 * 60 * 1000);
        };
        const get_menus_data = async() => {
            if (globalStore.authorityManage) {
                // const _res = await api_manage_user_auths();
                // if (_res.code == 200) {
                //     // sysStore.mainMenuData = _res.data.list;
                //     sysStore.initMenuData = _res.data.init_path || '';
                //     sysStore.menuDataLoadingEnd = true;
                //     sysStore.set_format_route_list(_res.data.list);
                //     getSearchButton.value && get_net_router(sysStore.mainMenuData as Required<IMenuData>[]);
                //     if (!window.location.href.includes('/')) {
                //         if (_res.data.init_path == '') {
                //             router.replace({
                //                 path: ''
                //             });
                //             createMessage.error('请通知管理员设置初始页面');
                //         } else {
                //             router.replace({
                //                 path: _res.data.init_path || '/'
                //             });
                //         }
                //     }
                // }
            } else {
                const _res = import('@/menus/index');
                const _list = (await _res).default;
                sysStore.initMenuData = '/quantum-lowcode/playground/';
                sysStore.set_format_route_list(_list);
                sysStore.menuDataLoadingEnd = true;
                getSearchButton.value && get_net_router(sysStore.mainMenuData as Required<IMenuData>[]);
            }
        };
        // get_global_env();
        get_menus_data();

        const dynamicComponent = import.meta.env.VITE_USE_PWA === 'true' ? defineAsyncComponent(() => {
            return import ('@/components/layout/qm-reload-prompt.vue');
        }) : null;

        return {
            locale,
            getThemeMode,
            userStore,
            globalStore,
            sysStore,
            dynamicComponent
        };
    }
});
</script>
<style data-type="start">
.style-start-load {
    text-align: center;
}
</style>
<style lang="scss" scoped>
#app {
    min-width: 1024px;
    overflow-x: auto
}
</style>

<style lang="scss">
@import '@quantum-design/styles/antd/antd.scss';
@import '@quantum-design/styles/base/index.scss';
.table-nowrap{
    .ant-table-cell {
        white-space: nowrap ;
        min-width: 100px
    }
}
</style>
