export function style2Obj(style: string) {
    if (typeof style !== 'string') {
        return style;
    }

    const obj: Record<string, any> = {};
    style.split(';').forEach((element) => {
        if (!element) {
            return;
        }

        const items = element.split(':');

        let key = items.shift();
        let value = items.join(':');

        if (!key) return;

        key = key.replace(/^\s*/, '').replace(/\s*$/, '');
        value = value.replace(/^\s*/, '').replace(/\s*$/, '');

        key = key
            .split('-')
            .map((v, i) => (i > 0 ? `${v[0].toUpperCase()}${v.substr(1)}` : v))
            .join('');

        obj[key] = value;
    });
    return obj;
}

export function fillBackgroundImage(value: string) {
    if (value && !/^url/.test(value) && !/^linear-gradient/.test(value)) {
        return `url(${value})`;
    }
    return value;
}
