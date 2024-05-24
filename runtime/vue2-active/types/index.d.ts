import { ISchemasRoot } from '@quantum-lowcode/schemas';

declare global {
    interface Window {
        PAGE_JSON: ISchemasRoot;
    }
}
