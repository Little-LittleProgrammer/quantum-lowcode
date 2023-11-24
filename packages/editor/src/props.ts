import { ISchemasRoot } from '@qimao/quantum-core';
import { ISandboxRect } from './types';

export interface IEditorProps {
    // root节点
    value?: ISchemasRoot;
    // 链接
    runtimeUrl?: string;
    boxRect?: ISandboxRect;
    codeOptions?: { [key: string]: any };
}

export const defaultEditorProps = {
    codeOptions: () => ({})
};
