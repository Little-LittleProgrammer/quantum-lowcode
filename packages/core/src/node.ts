import { ISchemasContainer, ISchemasNode, ISchemasPage } from '@qimao/quantum-schemas';
import { LowCodeRoot } from './app';
import { LowCodePage } from './page';
import { Subscribe } from '@qimao/quantum-utils';

interface INodeOptions {
    config: ISchemasNode | ISchemasContainer;
    page?: LowCodePage;
    parent?: LowCodeNode;
    root: LowCodeRoot;
}

export class LowCodeNode extends Subscribe {
    public data:ISchemasNode | ISchemasContainer | ISchemasPage;
    public page?: LowCodePage
    public parent?: LowCodeNode;
    public root: LowCodeRoot;

    constructor(options: INodeOptions) {
        super();
        this.page = options.page;
        this.parent = options.parent;
        this.root = options.root;
        this.data = options.config;
    }

    public setData(data: ISchemasNode | ISchemasContainer | ISchemasPage) {
        this.data = data;
        this.emit('updata-data');
    }

    public destroy() {
        this.clear();
    }

    // 生命周期
    private listenLifeSafe() {

    }
}
