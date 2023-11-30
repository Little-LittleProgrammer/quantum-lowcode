import { IInstallOptions } from './src/types';
import { setConfig } from './src/utils';
import { parseSchemas } from '@qimao/quantum-utils';

export * from './src/hooks';
export * from './src/types';
export * from './src/utils';

export {default as QuantumEditor} from './src/editor.vue';

const defaultInstallOpt: IInstallOptions = {
    parseSchemas,
};

setConfig(defaultInstallOpt);
