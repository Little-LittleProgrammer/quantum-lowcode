import { ISchemasRoot } from '@quantum-lowcode/core';

declare global {
    interface Window {
        PAGE_JSON: ISchemasRoot[];
    }
}
