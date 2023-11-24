import { ISchemasRoot } from '@qimao/quantum-core';

declare global {
    interface Window {
        lowCodeSchemas: ISchemasRoot[];
    }
}
