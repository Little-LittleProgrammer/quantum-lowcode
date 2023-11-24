import { IInstallOptions } from './src/types';
import { set_config } from './src/utils';

export * from './src/hooks';
export * from './src/types';
export * from './src/utils';

export {default as QuantumEditor} from './src/editor.vue';

const defaultInstallOpt: IInstallOptions = {
    // eslint-disable-next-line no-eval
    parseSchemas: (dsl: string) => eval(dsl)
};

set_config(defaultInstallOpt);
