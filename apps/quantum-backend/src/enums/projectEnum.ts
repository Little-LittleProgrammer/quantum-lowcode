import { IProjectConfig } from '@q-front-npm/vue3-antd-pc-ui';

const setting: IProjectConfig = {
    // 主题配置
    theme: {
        // 是否展示主题切换按钮
        showDarkModeToggle: true,
        // 是否开启网站灰色模式，悼念的日期开启(4.4, 4.5, 12.13)
        grayMode: false,
    },
    // 功能配置
    func: {
        // 是否展示菜单搜索按钮
        showSearchButton: true,
        // 是否开启回到顶部
        showBackTop: true,
        // 显示面包屑
        showBreadCrumb: false,
        // 左侧菜单栏是否可重复点击
        asideRepeatClick: false,
        // 切换界面的时候是否取消已经发送但是未响应的http请求, openKeepAlive为true是失效
        removeAllHttpPending: true,
        // 是否显示刷新按钮
        showReloadButton: true,
    },
    cacheTabsSetting: {
        // 是否展示
        show: true,
        // 是否开启KeepAlive缓存
        openKeepAlive: false,
        // 是否展示快速操作
        showQuick: true,
        // 是否可以拖拽
        canDrag: true,
        // 刷新后是否保留已经打开的标签页
        cache: false,
    },
    // 动画配置
    transition: {
        // 是否开启页面切换动画
        enable: true,
        // 是否打开页面切换loading
        openPageLoading: true,
        // 是否打开页面切换顶部进度条
        openNProgress: true,
    },

};

export enum DEVICE_TYPE {
    Phone = 'phone',
    Pad = 'pad',
    PC = 'pc',
}

export enum NEW_WORKSPACE_WIDTH {
    Left= 340,
    Center=600,
    Right = 1
}

export enum CLASSIC_WORKSPACE_WIDTH {
    Left= 1,
    Center= 500,
    Right = 0
}

export const DEV_RECT = {
    [DEVICE_TYPE.Phone]: {height: 817, width: 375, },
    [DEVICE_TYPE.Pad]: {height: 1024, width: 768, },
    [DEVICE_TYPE.PC]: {height: 1147, width: 981, },
};

export const UA_MAP = {
    [DEVICE_TYPE.Phone]:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    [DEVICE_TYPE.Pad]:
      'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
    [DEVICE_TYPE.PC]:
      'Mozilla/5.0 (Linux; U; Android 9; zh-CN; SM-F9000  Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.1.2.992 Mobile Safari/537.36',
};

export default setting;
