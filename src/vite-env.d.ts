/// <reference types="vite/client" /> // Keep this line if it exists

declare module 'virtual:campaign-data' {
    /**
     * Represents the data extracted from campaign-template-component.ts
     * Keys are property names, values are their initial values (string, number, boolean).
     */
    export const campaignData: Record<string, string | number | boolean | any>; // Using 'any' is simplest, or be more specific
    // You could refine the type if you know it will only be specific primitives:
    // export const campaignData: Record<string, string | number | boolean>;
}


// --- ADD SFMC PERSONALIZATION DECLARATIONS BELOW ---

/**
 * Placeholder type for the context object passed to the run method.
 * Add specific properties if you know them and want better type checking,
 * otherwise 'any' allows flexibility during local dev.
 */
declare interface CampaignComponentContext {
    [key: string]: any; // Allows accessing any property without error
    // Example known properties (optional):
    // user?: { id?: string; attributes?: Record<string, any>; };
    // campaign?: { experienceId?: string; };
  }
  
  /**
   * Placeholder interface for the main campaign template component class.
   * The 'run' method signature should match your component's usage.
   */
  declare interface CampaignTemplateComponent {
    run(context: CampaignComponentContext): Record<string, any> | void; // Or just object, or void, depending on SFMC requirements
  }
  
  /**
   * Placeholder declarations for the SFMC decorators.
   * These tell TypeScript the functions exist and are used as decorators.
   * They don't need an implementation here.
   * The return type 'PropertyDecorator' is a built-in TS type.
   */
  declare function title(label: string): PropertyDecorator;
  declare function richText(enabled: boolean): PropertyDecorator;
  
  // Add declarations for any other SFMC decorators you might use (e.g., @options, @header)
  // declare function options(...args: any[]): PropertyDecorator;
  
  // --- END OF SFMC PERSONALIZATION DECLARATIONS ---