import { IUiState } from '../types';
import { reactive } from 'vue';

const state = reactive<IUiState>({
    showSrc: true,
    sandboxRect: {
        width: 375,
        height: 817
    }
});

class UiService {
    public set<K extends keyof IUiState, T extends IUiState[K]>(name: K, value: T) {
        state[name] = value;
    }
    public get<K extends keyof IUiState>(name: K) {
        return state[name];
    }
    public destroy() {
        // TODO
    }
}

export type {UiService};

export const uiService = new UiService();
