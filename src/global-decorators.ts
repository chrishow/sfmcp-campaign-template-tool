// This file makes decorators available globally without needing imports

// Implement the decorators that are declared in campaign-component-context.d.ts
globalThis.title = function (label: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol): void {
        // Implementation here - in development, this can be empty
    };
};

globalThis.richText = function (isRichText: boolean): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol): void {
        // Implementation here - in development, this can be empty
    };
};

globalThis.header = function (label: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol): void {
        // Implementation here
    };
};

globalThis.subtitle = function (label: string): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol): void {
        // Implementation here
    };
};

globalThis.options = function (choices: Array<any>): PropertyDecorator {
    return function (target: any, propertyKey: string | symbol): void {
        // Implementation here
    };
};