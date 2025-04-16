// src/main.ts
import '../campaign/styles.less'; // Use .css or .less depending on your actual file
import Handlebars from 'handlebars';
import templateString from '../campaign/template.hbs?raw';
import { campaignData } from 'virtual:campaign-data';
import { setupMockSalesforceInteractions, cleanupMockSalesforceInteractions } from './sfmc-mocks';

// --- Type Definitions ---
type CampaignDataType = typeof campaignData;
type CompiledTemplateFn = (context: CampaignDataType) => string;
type ClientSideFunction = ((context: CampaignDataType, arg?: any) => void) | null;

// --- Global State ---
let currentData: CampaignDataType = campaignData;
let currentCompiledTemplateFn: CompiledTemplateFn = Handlebars.compile(templateString);
let currentClientSideApply: ClientSideFunction = null;
let currentClientSideReset: ClientSideFunction = null;

// --- Core Functions ---

/**
 * Executes the stored client-side reset function, if available.
 */
function runClientSideReset(): void {
  if (typeof currentClientSideReset === 'function') {
    // console.log('Executing client-side reset function...');
    try {
      currentClientSideReset(currentData, null); // Pass context, template arg likely ignored
    } catch (error) {
      console.error('Error executing client-side reset function:', error);
    }
  } else {
    // console.log('No client-side reset function available to run.');
  }
}

/**
 * Executes the stored client-side apply function, if available.
 */
function runClientSideApply(): void {
  if (typeof currentClientSideApply === 'function') {
    // console.log('Executing client-side apply function...');
    try {
      // Pass current data and the current compiled template function
      currentClientSideApply(currentData, currentCompiledTemplateFn);
    } catch (error) {
      console.error('Error executing client-side apply function:', error);
      // Add hints for common errors if needed
    }
  } else {
    console.log('No client-side apply function available to run (was it registered?).');
  }
}

/**
 * Sets up the mock 'registerTemplate' on the window.
 * This version defers the execution of 'apply'.
 */
function setupMockRegisterTemplate(): void {
  // console.log('Setting up mock window.registerTemplate (Deferring apply execution)');
  type TemplateDefinition = {
    apply: (context: CampaignDataType, templateFn: CompiledTemplateFn) => void;
    reset: (context: CampaignDataType, template?: any) => void;
    control: (context: CampaignDataType) => void;
  };

  (window as any).registerTemplate = (definition: TemplateDefinition) => {
    // console.log('Mock registerTemplate called by client script.');
    // Store the functions provided by the script
    currentClientSideApply = definition.apply;
    currentClientSideReset = definition.reset;

    if (typeof currentClientSideApply === 'function') {
      // console.log("Apply function registered by client script, execution deferred.");
    } else {
      console.warn("Client script did not provide a valid Apply function during registration.");
    }
    if (typeof currentClientSideReset === 'function') {
      // console.log('Reset function registered by client script.');
    }
  };
}

/**
 * Loads the client script via standard import for the initial page load.
 * Assumes the imported script's IIFE will call registerTemplate.
 */
async function initialLoadClientScript(): Promise<void> {
  // console.log('Initial Load: Starting...');
  // Reset is run first (no-op typically, but good practice)
  runClientSideReset();

  // Clear any potentially stale state from previous injections/attempts
  currentClientSideApply = null;
  currentClientSideReset = null;

  // Setup mocks required by the client script
  setupMockSalesforceInteractions();
  setupMockRegisterTemplate(); // Version that defers apply execution

  // console.log('Initial Load: Dynamically importing client-side.js...');
  try {
    // @ts-ignore TS2306 - Ignore editor error for importing non-module IIFE script
    await import('../campaign/client-side.js');
    // console.log('Initial Load: client-side.js import awaited.');

    // Check if registration worked and explicitly run apply
    if (typeof currentClientSideApply === 'function') {
      // console.log("Initial Load: Apply function registered. Explicitly calling it now...");
      runClientSideApply(); // Explicitly trigger apply
    } else {
      console.error("Initial Load: FAILED to register apply function after import. IIFE likely didn't run or registerTemplate failed.");
    }
  } catch (error) {
    console.error('Initial Load: Failed during import or execution:', error);
  }
}

/**
 * Handles HMR updates for client-side.js by fetching its content and using eval.
 * This forces the IIFE to re-execute reliably during HMR.
 */
async function handleClientScriptHMRUpdate(): Promise<void> {
  console.log('HMR Handler: Starting update for client-side.js');

  // 1. Run the OLD reset function
  runClientSideReset();

  // 2. Clear state and setup mocks for the new script execution
  currentClientSideApply = null;
  currentClientSideReset = null;
  setupMockSalesforceInteractions();
  setupMockRegisterTemplate(); // Ensure deferred mock is ready

  // 3. Fetch the updated script content using an ABSOLUTE URL w/ cache busting
  const viteOrigin = new URL(import.meta.url).origin;
  const scriptPath = '/campaign/client-side.js'; // Path relative to Vite root
  const scriptUrl = `${viteOrigin}${scriptPath}?t=${Date.now()}`;

  console.log(`HMR Handler: Fetching ${scriptUrl}...`);
  try {
    const response = await fetch(scriptUrl);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    const scriptContent = await response.text();
    // console.log('HMR Handler: Fetched script content.');

    // 4. Evaluate the fetched script content (IIFE)
    // console.log('HMR Handler: Evaluating new client-side.js content...');
    eval(scriptContent); // Runs IIFE -> calls registerTemplate -> stores functions
    // console.log('HMR Handler: Evaluation complete.');

    // 5. Verify registration and explicitly call apply
    if (typeof currentClientSideApply === 'function') {
      // console.log("HMR Handler: Apply function registered successfully via eval. Explicitly calling it now...");
      runClientSideApply(); // Explicitly trigger apply
    } else {
      console.error("HMR Handler: FAILED to register apply function after eval.");
    }
  } catch (e) {
    console.error("HMR Handler: Error fetching or evaluating client-side.js content:", e);
  }
}


// --- Initial Load Trigger ---
initialLoadClientScript();


// --- HMR Setup ---
if (import.meta.hot) {
  console.log('HMR enabled.');

  // HMR for Handlebars template
  import.meta.hot.accept('../campaign/template.hbs?raw', (newModule) => {
    if (!newModule) return;
    console.log('HMR: template.hbs updated.');
    // Recompile template
    currentCompiledTemplateFn = Handlebars.compile(newModule.default);
    // Reset old widget state
    runClientSideReset();
    // Apply new template with current client logic/data
    runClientSideApply();
  });

  // HMR for Virtual Campaign Data
  import.meta.hot.on('campaign-data-update', (newData: CampaignDataType) => {
    console.log('HMR: campaign-data-update received.');
    if (newData && JSON.stringify(newData) !== JSON.stringify(currentData)) {
      currentData = newData; // Update data
      // Reset old widget state
      runClientSideReset();
      // Apply current template/logic with new data
      runClientSideApply();
    } else {
      console.log('HMR: Campaign data unchanged or invalid.');
    }
  });

  // HMR for Client-side JS (uses fetch/eval handler)
  import.meta.hot.accept('../campaign/client-side.js', handleClientScriptHMRUpdate);

  // HMR Dispose - Cleanup
  import.meta.hot.dispose(() => {
    console.log('HMR: Disposing module...');
    runClientSideReset(); // Attempt final cleanup
    cleanupMockSalesforceInteractions(); // Cleanup SFMC mocks
    // Cleanup registerTemplate mock
    if ((window as any).registerTemplate) delete (window as any).registerTemplate;
    currentClientSideApply = null;
    currentClientSideReset = null;
  });

} else {
  console.log('HMR not enabled.');
}