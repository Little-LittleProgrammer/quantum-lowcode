import { ISandboxRect, IUiState } from '../types';
import { reactive } from 'vue';
import { convertToNumber } from '@qimao/quantum-utils';
import { editorService } from './editor-service';

class UiService {
    private state = reactive<IUiState>({
        uiSelectMode: false,
        showCode: false,
        sandboxRect: {
            width: 375,
            height: 817,
        },
        zoom: 1,
        sandboxContainerRect: {
            width: 0,
            height: 0,
        },
        showGuides: true,
        workspaceLeft: 340,
        workspaceCenter: 600,
        workspaceRight: 1,
    });
    public set<K extends keyof IUiState, T extends IUiState[K]>(
        name: K,
        value: T
    ) {
        if (name === 'sandboxRect') {
            this.setSandboxRect(value as unknown as ISandboxRect);
            return;
        }
        const mask = editorService.get('sandbox')?.mask;

        if (name === 'showGuides') {
            mask?.showGuides(value as unknown as boolean);
        }
        this.state[name] = value;
    }

    public get<K extends keyof IUiState>(name: K) {
        return this.state[name];
    }

    public async zoom(zoom: number) {
        this.set('zoom', (this.get('zoom') * 100 + zoom * 100) / 100);
        if (this.get('zoom') < 0.1) this.set('zoom', 0.1);
    }

    public async calcZoom() {
        const { sandboxRect, sandboxContainerRect, } = this.state;
        const { height, width, } = sandboxContainerRect;
        if (!width || !height) return 1;

        const sWidth = convertToNumber(sandboxRect.width, width);
        const sHeight = convertToNumber(sandboxRect.height, height);

        if (width > sWidth && height > sHeight) {
            return 1;
        }

        // 60/80是为了不要让画布太过去贴住四周（这样好看些）
        return Math.min(
            (width - 60) / sWidth || 1,
            (height - 80) / sHeight || 1
        );
    }

    public reset() {
        this.set('showCode', false);
        this.set('uiSelectMode', false);
        this.set('zoom', 1);
        this.set('sandboxContainerRect', {
            width: 0,
            height: 0,
        });
    }
    public destroy() {
        // TODO
        this.reset();
    }
    private async setSandboxRect(value: ISandboxRect) {
        this.state.sandboxRect = {
            ...this.state.sandboxRect,
            ...value,
        };
        this.state.zoom = await this.calcZoom();
    }
}

export type { UiService };

export const uiService = new UiService();
