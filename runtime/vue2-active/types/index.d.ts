import { ISchemasRoot } from '@qimao/quantum-schemas';

declare global {
    interface Window {
        PAGE_JSON: ISchemasRoot;
    }
}
