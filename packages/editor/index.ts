import { IInstallOptions } from './src/types';
import { setConfig } from './src/utils';
import { parseSchemas } from '@quantum-lowcode/utils';

export * from './src/hooks';
export * from './src/types';
export * from './src/utils';

export * from './src/services/editor-service';
export * from './src/services/ui-service';

export {default as QuantumEditor} from './src/editor.vue';

const defaultInstallOpt: IInstallOptions = {
    parseSchemas,
};

setConfig(defaultInstallOpt);
