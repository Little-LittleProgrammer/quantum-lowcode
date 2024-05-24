import { native_try_catch } from './error';

type Callback = (...data: any) => void

export class Subscribe<T = string> {
    cache: Map<T, Callback[]>;
    cacheOnce: Map<T, Callback[]>;
    constructor() {
        this.cache = new Map();
        this.cacheOnce = new Map();
    }
    // 订阅消息
    /**
     *
     * @param eventName
     * @param callBack
     * @param strict 是否开启严格校验
     * @returns
     */
    on(eventName: T, callBack: Callback, strict = false) {
        if (strict && (callBack as any).__id) {
            return;
        }
        if (strict) {
            callBack.__id = Symbol('id');
        }
        const _inOnce = this.cacheOnce.get(eventName);
        if (_inOnce) {
            console.error('此事件已经在单次订阅中注册, 无法再次注册');
            return;
        }
        const _fns = this.cache.get(eventName);
        if (_fns) {
            if (!strict) { // 非严格去重
                const isSubscribed = _fns.some(fn => fn.toString() === callBack.toString());
                if (isSubscribed) { // 监测是否重复订阅
                    return;
                }
            }
            this.cache.set(eventName, _fns.concat(callBack));
            return;
        }
        this.cache.set(eventName, [callBack]);
    }
    // 单次订阅
    once(eventName: T, callBack: Callback, strict = false) {
        if (strict && (callBack as any).__id) {
            console.log(`Already subscribed to "${eventName}"`);
        }
        if (strict) {
            callBack.__id = Symbol('id');
        }
        const _inOn = this.cache.get(eventName);
        if (_inOn) {
            console.error('此事件已经在长期订阅中注册, 无法再次注册');
            return;
        }
        const _fns = this.cacheOnce.get(eventName);
        if (_fns) {
            if (!strict) { // 非严格去重
                const isSubscribed = _fns.some(fn => fn.toString() === callBack.toString());
                if (isSubscribed) { // 监测是否重复订阅
                    return;
                }
            }
            this.cacheOnce.set(eventName, _fns.concat(callBack));
            return;
        }
        this.cacheOnce.set(eventName, [callBack]);
    }
    // 发布消息
    emit(eventName: T, ...args: any) {
        if (!eventName) return;
        const _fns = this.cache.get(eventName);
        const _fnsOnce = this.cacheOnce.get(eventName);
        if (_fns) {
            this.executeFn(eventName, _fns, ...args);
        } else if (_fnsOnce) {
            this.executeFn(eventName, _fnsOnce, ...args);
            this.remove(eventName); // 单次订阅, 执行完移除
        }
    }
    // 执行
    private executeFn(eventName: T, fns:Callback[], ...args: any) {
        fns.forEach((fn) => {
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
        this.cacheOnce.clear();
    }
    // 移除订阅事件
    remove(eventName: T) {
        if (this.cache.has(eventName)) {
            this.cache.delete(eventName);
        }
        if (this.cacheOnce.has(eventName)) {
            this.cacheOnce.delete(eventName);
        }
    }
}
