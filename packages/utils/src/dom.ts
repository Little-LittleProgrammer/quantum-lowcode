export function inject_style(doc: Document, style: string) {
    const styleEl = doc.createElement('style');
    styleEl.innerHTML = style;
    doc.head.appendChild(styleEl);
    return styleEl;
}

