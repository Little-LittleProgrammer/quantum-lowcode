import * as components from './src/components';
export * from './src/components';

export default {
    install: (app: any) => {
        Object.keys(components).forEach(key => {
            if ((components as any)[key] && (components as any)[key].__name) {
                const component = components[key as keyof typeof components];
                if ((component as any).install) {
                    app.use(component);
                }
            }
        });
        return app;
    },
};

