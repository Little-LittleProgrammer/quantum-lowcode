import {BoxCore, type IBoxCoreConfig} from '@qimao/quantum-sandbox';

export function useBox(boxOptions: IBoxCoreConfig) {
    const sandbox = new BoxCore({
        runtimeUrl: boxOptions.runtimeUrl
    });
    return sandbox;
}
