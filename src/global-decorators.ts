// import { title, subtitle, options, richText } from './decorators';

function header(label: string): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol): void {
        // Store metadata or perform actions as needed
        // console.log(`[header decorator] ${String(propertyKey)}: ${label}`);
    };
}

export function title(label: string): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol): void {
        // console.log(`[title decorator] ${String(propertyKey)}: ${label}`);
    };
}

function subtitle(label: string): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol): void {
        // console.log(`[subtitle decorator] ${String(propertyKey)}: ${label}`);
    };
}

function richText(isRichText: boolean): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol): void {
        // console.log(`[richText decorator] ${String(propertyKey)}: ${isRichText}`);
    };
}


function options(choices: Array<any>): PropertyDecorator {
    return function (target: Object, propertyKey: string | symbol): void {
        // console.log(`[options decorator] ${String(propertyKey)}: ${JSON.stringify(choices)}`);
    };
}

// Expose decorators globally
(window as any).header = header;
(window as any).title = title;
(window as any).subtitle = subtitle;
(window as any).options = options;
(window as any).richText = richText;

