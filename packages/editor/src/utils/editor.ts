import { ISchemasContainer, ISchemasNode, ISchemasRoot, Id } from '@qimao/quantum-schemas';
import { calcValueByDesignWidth, getNodePath, isPage, js_is_number } from '@qimao/quantum-utils';
import { Layout } from '../types';
import { BoxCore } from '@qimao/quantum-sandbox';

export const COPY_STORAGE_KEY = 'QuantumEditorCopyData';

export function getNodeIndex(id: Id, parent: ISchemasRoot | ISchemasContainer) {
    const children = parent?.children;
    return children.findIndex((item:ISchemasNode) => `${item.field}` === `${id}`);
}

export function getRelativeStyle(style: Record<string, any> = {}){
    return {
        ...style,
        position: 'relative',
        top: 0,
        left: 0,
    };
}

export function setChildrenLayout(node:ISchemasNode, layout:Layout) {
    node.children?.forEach((child: ISchemasNode) => {
        setLayout(child, layout);
    });
    return node;
}

export function setLayout(node:ISchemasNode, layout:Layout) {
    const style = node.style || {};

    // 是 fixed 不做处理
    if (style.position === 'fixed') return;

    if (layout !== Layout.RELATIVE) {
        style.position = 'absolute';
    } else {
        node.style = getRelativeStyle(style) as any;
        node.style!.right = 'auto';
        node.style!.bottom = 'auto';
    }
    return node;
}

export function change2Fixed(node:ISchemasNode, root:ISchemasRoot) {
    const path = getNodePath(node.field, root.children);
    const offset = {left: 0, top: 0, };
    path.forEach((val) => {
        offset.left = offset.left + globalThis.parseFloat(val.style?.left || 0),
        offset.top = offset.top + globalThis.parseFloat(val.style?.top || 0);
    });

    return {
        ...(node.style || {}),
        ...offset,
    };
}

export function getInitPositionStyle(style: Record<string, any> = {}, layout: Layout) {
    if (layout === Layout.ABSOLUTE) {
        const newStyle: Record<string, any> = {
            ...style,
            position: 'absolute',
        };

        if (typeof newStyle.left === 'undefined' && typeof newStyle.right === 'undefined') {
            newStyle.left = 0;
        }

        return newStyle;
    }

    if (layout === Layout.RELATIVE) {
        return getRelativeStyle(style);
    }

    return style;
}

export function getMiddleTop(node: ISchemasNode, parentNode: ISchemasContainer, stage: BoxCore | null) {
    let height = node.style?.height || 0;
    const designWidth = stage?.designWidth

    if (!stage || typeof node.style?.top !== 'undefined' || !parentNode.style) return node.style?.top;

    if (!js_is_number(height)) {
        height = 0;
    }

    const { height: parentHeight } = parentNode.style;
    // wrapperHeight 是未 calcValue的高度, 所以要将其calcValueByFontsize一下, 否则在pad or pc端计算的结果有误
    const { scrollTop = 0, wrapperHeight } = stage.mask;
    const wrapperHeightDeal = calcValueByDesignWidth(stage.renderer.getDocument()!, wrapperHeight, designWidth);
    const scrollTopDeal = calcValueByDesignWidth(stage.renderer.getDocument()!, scrollTop, designWidth);
    if (isPage(parentNode as any)) {
      return (wrapperHeightDeal - height) / 2 + scrollTopDeal;
    }
  
    // 如果容器的元素高度大于当前视口高度的2倍, 添加的元素居中位置也会看不见, 所以要取最小值计算
    return (Math.min(parentHeight, wrapperHeightDeal) - height) / 2;
}

export function fixNodeLeft(config: ISchemasNode, parent:ISchemasContainer, stage: BoxCore | null) {
    let doc = stage?.renderer.getDocument();
    let designWidth = stage?.designWidth
    if (!doc || !config.style || !js_is_number(config.style.left)) return config.style?.left;

    const el = doc.getElementById(config.field);
    const parentEl = doc.getElementById(parent.field);

    const left = Number(config.style?.left) || 0;
    if (el && parentEl) {
        const calcParentOffsetWidth = calcValueByDesignWidth(doc, parentEl.offsetWidth, designWidth);
        const calcElOffsetWidth = calcValueByDesignWidth(doc, el.offsetWidth, designWidth);
        if (calcElOffsetWidth + left > calcParentOffsetWidth) {
            return calcParentOffsetWidth - calcElOffsetWidth;
        }
    }

    return config.style.left;
}

export function fixNodePosition(config: ISchemasNode, parent: ISchemasContainer, sandbox: BoxCore | null) {
    if (config.style?.position !== 'absolute') {
        return config.style;
    }
    return {
        ...(config.style || {}),
        top: getMiddleTop(config, parent, sandbox),
        left: fixNodeLeft(config, parent, sandbox),
    };
}

export async function fixed2Other(node:ISchemasNode, root:ISchemasRoot, getLayout: (parent: ISchemasNode, node?: ISchemasNode | null) => Layout) {
    const path = getNodePath(node.field, root.children);
    const cur = path.pop();
    const offset = {
        left: cur?.style?.left || 0,
        top: cur?.style?.top || 0,
        right: '',
        bottom: '',
    };

    path.forEach(val => {
        offset.left = offset.left - globalThis.parseFloat(val.style?.left || 0);
        offset.top = offset.top - globalThis.parseFloat(val.style?.top || 0);
    });

    const style = node.style || {};

    const parent = path.pop();
    if (!parent) {
        return getRelativeStyle(style);
    }

    const layout = getLayout(parent);
    if (layout !== Layout.RELATIVE) {
        return {
            ...style,
            ...offset,
            position: 'absolute',
        };
    }

    return getRelativeStyle(style);
}
