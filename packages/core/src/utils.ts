import { DEFAULT_DESIGN_WIDTH, Fn } from '@quantum-lowcode/schemas';
import {
    fillBackgroundImage,
    isString,
    style2Obj
} from '@quantum-lowcode/utils';

export function getTransform(value: Record<string, string>) {
    if (!value) return [];

    const transform = Object.entries(value).map(
        ([transformKey, transformValue]) => {
            if (!transformValue || !transformValue.trim()) return '';
            if (
                transformKey === 'rotate' &&
				/^[-]?[0-9]*[.]?[0-9]*$/.test(transformValue)
            ) {
                transformValue = `${transformValue}deg`;
            }

            // return !isH5 ? `${transformKey}(${transformValue})` : { [transformKey]: transformValue, };
            return `${transformKey}(${transformValue})`;
        }
    );

    // if (isH5) {
    //     return transform;
    // }
    const values = transform.join(' ');
    return !values.trim() ? 'none' : values;
}
/**
 * 将schemas中的style配置转换成css，主要是将数值转成rem为单位的样式值，例如100将被转换成1rem
 * @param style Object
 * @returns Object
 */
export function defaultTransformStyle(style: Record<string, any> | string | Fn, designWidth = DEFAULT_DESIGN_WIDTH) {
    if (!style) return {};
    if (!designWidth) {
        designWidth = DEFAULT_DESIGN_WIDTH;
    }

    let styleObj: Record<string, any> = {};
    const results: Record<string, any> = {};

    if (isString(style)) {
        styleObj = style2Obj(style);
    } else {
        styleObj = { ...style };
    }

    const whiteList = ['zIndex', 'opacity', 'fontWeight'];
    Object.entries(styleObj).forEach(([key, value]) => {
        if (key === 'scale' && !results.transform) {
            // if (key === 'scale' && !results.transform && isHippy) {
            results.transform = [{ scale: value }];
        } else if (key === 'backgroundImage') {
            value && (results[key] = fillBackgroundImage(value));
        } else if (key === 'transform' && typeof value !== 'string') {
            results[key] = getTransform(value);
        } else if (
            !whiteList.includes(key) &&
			value &&
			/^[-]?[0-9]*[.]?[0-9]*$/.test(value)
        ) {
            results[key] = `${
                (parseInt(value) /
					(designWidth)) *
				10
            }rem`;
        } else {
            results[key] = value;
        }
    });

    return results;
}
