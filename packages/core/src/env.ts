/**
 * 设置 运行环境的 env
 */
export class Env {
    isIos = false;
    isIphone = false;
    isIpad = false;
    isAndroid = false;
    isAndroidPad = false;
    isMac = false;
    isWin = false;
    isMqq = false;
    isWechat = false;
    isWeb = false;

    constructor(ua = globalThis.navigator.userAgent, options: Record<string, boolean | string> = {}) {
        this.isIphone = ua.indexOf('iPhone') >= 0;

        this.isIpad = /(iPad).*OS\s([\d_]+)/.test(ua);

        this.isIos = this.isIphone || this.isIpad;

        this.isAndroid = ua.indexOf('Android') >= 0;

        this.isAndroidPad = this.isAndroid && ua.indexOf('Mobile') < 0;

        this.isMac = ua.indexOf('Macintosh') >= 0;

        this.isWin = ua.indexOf('Windows') >= 0;

        this.isMqq = /QQ\/([\d.]+)/.test(ua);

        this.isWechat = ua.indexOf('MicroMessenger') >= 0 && ua.indexOf('wxwork') < 0;

        this.isWeb = !this.isIos && !this.isAndroid && !/(WebOS|BlackBerry)/.test(ua);

        Object.entries(options).forEach(([key, value]) => {
            (this as any)[key] = value;
        });
    }
}
