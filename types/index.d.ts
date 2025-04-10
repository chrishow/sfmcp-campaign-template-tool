/// <reference types="vite/client" />

interface CampaignComponentContext {
    campaign: string;
    experience: string;
    userGroup: string;
    [key: string]: any;
    // Add properties as needed
}

interface CampaignTemplateComponent {
    run(context: CampaignComponentContext): any;
}

// Decorator function declarations
declare function header(label: string): PropertyDecorator;
declare function title(label: string): PropertyDecorator;
declare function subtitle(label: string): PropertyDecorator;
declare function options(choices: Array<any>): PropertyDecorator;

// Make all declarations global without using the 'global' block
declare global {
    // These need to be in the global namespace too
    interface CampaignComponentContext {
        campaign: string;
        experience: string;
        userGroup: string;
        [key: string]: any;
    }

    interface CampaignTemplateComponent {
        run(context: CampaignComponentContext): Record<string, any>;
    }

    // Your global declarations go here
    interface Window {
        myGlobalVariable: string; // Example
    }
}

export { }; // Make this an external module