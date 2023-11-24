export function native_try_catch(fn: () => void, errorFn?: (err: any) => void): void {
    try {
        fn();
    } catch (err) {
        if (errorFn) {
            errorFn(err);
        } else {
            console.error('err', err);
        }
    }
}
