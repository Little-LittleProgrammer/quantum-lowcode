import { Subscribe } from '@qimao/quantum-utils';

import {IHistoryState, StepValue} from '../types';
import { reactive } from 'vue';
import { ISchemasPage } from '@qimao/quantum-schemas';
import { UndoRedo } from '../utils/undo-redo';

class HistoryService extends Subscribe {
    public state = reactive<IHistoryState>({
        pageSteps: {},
        pageField: undefined,
        canRedo: false,
        canUndo: false,
    });

    constructor() {
        super();

        this.on('change', () => this.setCanUndoRedo());
    }

    public reset() {
        this.state.pageSteps = {};
        this.resetPage();
    }

    public resetPage() {
        this.state.pageField = undefined;
        this.state.canRedo = false;
        this.state.canUndo = false;
    }

    public changePage(page: ISchemasPage): void {
        if (!page) return;

        this.state.pageField = page.field;

        if (!this.state.pageSteps[this.state.pageField]) {
            const undoRedo = new UndoRedo<StepValue>();

            undoRedo.pushElement({
                data: page,
                modifiedNodeFields: new Map(),
                nodeField: page.field,
            });

            this.state.pageSteps[this.state.pageField] = undoRedo;
        }

        this.setCanUndoRedo();

        this.emit('page-change', this.state.pageSteps[this.state.pageField]);
    }

    public push(state: StepValue): StepValue | null {
        const undoRedo = this.getUndoRedo();
        if (!undoRedo) return null;
        undoRedo.pushElement(state);
        this.emit('change', state);
        return state;
    }

    // 撤销
    public undo(): StepValue | null {
        const undoRedo = this.getUndoRedo();
        if (!undoRedo) return null;
        const state = undoRedo.undo();
        this.emit('change', state);
        return state;
    }

    // 恢复
    public redo(): StepValue | null {
        const undoRedo = this.getUndoRedo();
        if (!undoRedo) return null;
        const state = undoRedo.redo();
        this.emit('change', state);
        return state;
    }

    public destroy(): void {
        this.reset();
        this.clear();
    }

    private getUndoRedo() {
        if (!this.state.pageField) return null;
        return this.state.pageSteps[this.state.pageField];
    }

    private setCanUndoRedo(): void {
        const undoRedo = this.getUndoRedo();
        this.state.canRedo = undoRedo?.canRedo() || false;
        this.state.canUndo = undoRedo?.canUndo() || false;
    }
}
export type { HistoryService };

export const historyService = new HistoryService();
