import { ISchemasContainer, ISchemasNode, ISchemasPage, Id } from '@qimao/quantum-schemas';
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
        if (this.root.dataSourceDep.has(this.data.field)) {
            const deps = this.root.dataSourceDep.get(this.data.field) || [];
            for (let i = deps.length - 1; i > 0; i--) {
                if (deps[i].field === field) {
                    deps.splice(i, 1);
                }
            }
            if (deps.length === 0) {
                this.root.dataSourceDep.delete(this.data.field);
            } else {
                this.root.dataSourceDep.set(this.data.field, deps);
            }
        }
    }

    public destroy(): void {
        super.destroy();
        this.nodes.clear();
    }
}
