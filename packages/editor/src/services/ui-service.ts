import { ISandboxRect, IUiState } from '../types';
import { reactive } from 'vue';
import {convertToNumber} from '@qimao/quantum-utils';

const state = reactive<IUiState>({
    showSrc: true,
    sandboxRect: {
        width: 375,
        height: 817,
    },
    zoom: 1,
    sandboxContainerRect: {
        width: 0,
        height: 0,
    },
});

class UiService {
    public set<K extends keyof IUiState, T extends IUiState[K]>(name: K, value: T) {
        if (name === 'sandboxRect') {
            this.setSandboxRect(value as unknown as ISandboxRect);
            return;
        }
        state[name] = value;
    }
    public get<K extends keyof IUiState>(name: K) {
        return state[name];
    }
    public async zoom(zoom: number) {
        this.set('zoom', (this.get('zoom') * 100 + zoom * 100) / 100);
        if (this.get('zoom') < 0.1) this.set('zoom', 0.1);
    }
    public async calcZoom() {
        const { sandboxRect, sandboxContainerRect, } = state;
        const { height, width, } = sandboxContainerRect;
        if (!width || !height) return 1;
        const sWidth = convertToNumber(sandboxRect.width, width);
        const sHeight = convertToNumber(sandboxRect.height, height);
        if (width > sWidth && height > sHeight) {
            return 1;
        }

        // 60/80是为了不要让画布太过去贴住四周（这样好看些）
        return Math.min((width - 60) / sWidth || 1, (height - 80) / sHeight || 1);
    }
    public destroy() {
        // TODO
    }
    private async setSandboxRect(value: ISandboxRect) {
        state.sandboxRect = {
            ...state.sandboxRect,
            ...value,
        };
        state.zoom = await this.calcZoom();
    }
}

export type {UiService};

export const uiService = new UiService();
