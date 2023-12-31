import { component_with_install } from '@qimao/quantum-utils';
import CodeEditor from './src/code-editor.vue';

export type {
    CodeEditor
};

const QCodeEditor = component_with_install(CodeEditor);

export default QCodeEditor;
