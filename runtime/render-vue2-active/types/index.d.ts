import { ISchemasRoot } from '@qimao/quantum-core';

declare global {
    interface Window {
        PAGE_JSON: ISchemasRoot;
    }
}
