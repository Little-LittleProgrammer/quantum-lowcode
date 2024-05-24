import { ISchemasContainer, ISchemasNode, ISchemasPage, Id } from '@quantum-lowcode/schemas';
import { LowCodeRoot } from './app';
import { LowCodeNode } from './node';

interface IConfigOptions {
    config: ISchemasPage;
    root: LowCodeRoot;
}

export class LowCodePage extends LowCodeNode {
    public nodes = new Map<Id, LowCodeNode>();
    constructor(options: IConfigOptions) {
        super(options);
        this.setNode(options.config.field, this);
        this.initNode(options.config, this);
        // this.root.dataSourceManager?.trigger();
    }

    public initNode(config: ISchemasContainer | ISchemasNode, parent: LowCodeNode) {
        const node = new LowCodeNode({
            config,
            parent,
            page: this,
            root: this.root,
            init: true,
        });
        this.setNode(config.field, node);
        config.children?.forEach(element => {
            this.initNode(element, node);
        });
    }

    public getNode(field: Id) {
        return this.nodes.get(field);
    }

    public setNode(field: Id, node: LowCodeNode) {
        this.nodes.set(field, node);
    }

    public deleteNode(field: Id) {
        this.nodes.delete(field);
    }

    public destroy(): void {
        super.destroy();
        this.nodes.clear();
    }
}
