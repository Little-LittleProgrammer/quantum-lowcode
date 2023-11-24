import { native_try_catch } from './error';

type Callback = (...data: any) => void

export class Subscribe<T = string> {
    cache: Map<T, Callback[]>;
    constructor() {
        this.cache = new Map();
    }
    // 订阅消息
    on(eventName: T, callBack: Callback) {
        const _fns = this.cache.get(eventName);
        if (_fns) {
            const isSubscribed = _fns.some(fn => fn.toString() === callBack.toString());
            if (isSubscribed) { // 监测是否重复订阅
                return;
            }
            this.cache.set(eventName, _fns.concat(callBack));
            return;
        }
        this.cache.set(eventName, [callBack]);
    }
    // 发布消息
    emit(eventName: T, ...args: any) {
        const _fns = this.cache.get(eventName);
        if (!eventName || !_fns) return;
        _fns.forEach((fn) => {
            native_try_catch(
                () => { fn(...args); },
                (e: Error) => {
                    console.error(
                        `Subscribe.notify: 监听事件的回调函数发生错误\n
                        eventName:${eventName}\n
                        ${e}`
                    );
                });
        });
    }
    // 清空订阅事件
    clear() {
        this.cache.clear();
    }
    // 移除订阅事件
    remove(eventName: T) {
        if (this.cache.has(eventName)) {
            this.cache.delete(eventName);
        }
    }
}
