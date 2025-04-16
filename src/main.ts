// src/main.ts
import './campaign/styles.less';
import Handlebars from 'handlebars';
import templateString from './campaign/template.hbs?raw';
import { campaignData } from 'virtual:campaign-data';

// Import the mock setup and cleanup functions
import { setupMockSalesforceInteractions, cleanupMockSalesforceInteractions } from './sfmc-mocks';

type CampaignDataType = typeof campaignData;
type CompiledTemplateFn = (context: any) => string; // Handlebars compile returns a function that yields a string

let currentData: CampaignDataType = campaignData;

// Compile the initial template and store the function
let currentCompiledTemplateFn: CompiledTemplateFn = Handlebars.compile(templateString);

// Store the functions provided by client-side.js
let currentClientSideApply: ((context: CampaignDataType, templateFn: CompiledTemplateFn) => void) | null = null;
let currentClientSideReset: ((context: CampaignDataType, template?: any) => void) | null = null; // Store reset


// --- Mock SFMC SDK ---
/**
 * Defines the mock 'registerTemplate' function on the window object.
 */
// src/main.ts

// src/main.ts
function setupMockRegisterTemplate() {
  console.log('Setting up mock window.registerTemplate (Deferring apply execution)');
  type TemplateDefinition = {
    apply: (context: CampaignDataType, templateFn: CompiledTemplateFn) => void;
    reset: (context: CampaignDataType, template?: any) => void;
    control: (context: CampaignDataType) => void;
  };

  (window as any).registerTemplate = (definition: TemplateDefinition) => {
    console.log('Mock registerTemplate called.');
    // Store the functions provided by the script during eval
    currentClientSideApply = definition.apply;
    currentClientSideReset = definition.reset;

    // Log that registration happened but execution is deferred
    if (currentClientSideApply && typeof currentClientSideApply === 'function') {
      console.log("Apply function registered, execution deferred.");
    } else {
      console.warn("Apply function was NOT provided or invalid during registration.");
    }

    // Log if reset was stored
    if (currentClientSideReset && typeof currentClientSideReset === 'function') {
      console.log('Stored client-side reset function.');
    }
  };
}

/**
 * Executes the stored client-side reset function, if available.
 */
function runClientSideReset() {
  if (typeof currentClientSideReset === 'function') {
    console.log('Executing client-side reset function...');
    try {
      // Pass context, template arg is likely ignored by reset
      currentClientSideReset(currentData, null);
    } catch (error) {
      // Important: Log error, but proceed. If reset fails, the old widget might linger,
      // but we still want to try applying the new one.
      console.error('Error executing client-side reset function:', error);
    }
  } else {
    console.log('No client-side reset function available to run (might be first load or script change).');
  }
}

/**
 * Executes the stored client-side apply function, if available.
 */
function runClientSideApply() {
  if (currentClientSideApply) {
    console.log('Executing client-side apply function...');
    try {
      // Pass current data and the current template function
      currentClientSideApply(currentData, currentCompiledTemplateFn);
    } catch (error) {
      console.error('Error executing client-side apply function:', error);
      if (error instanceof TypeError && error.message.includes('parameter 1 is not of type \'Node\'')) {
        console.warn("Hint: client-side.js's apply function might need adjustment. It received an HTML string from Handlebars but tried to appendChild. Consider using element.innerHTML = htmlString; on a container.");
      }
    }
  } else {
    console.log('No client-side apply function available to run.');
  }
}

/**
 * Adds a minimal delay using setTimeout.
 * @param ms Milliseconds to delay (defaults to 0 for next event loop tick)
 */
// function delay(ms = 0): Promise<void> {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
function delay(ms = 0): void {
  return;
}


async function handleClientScriptHMRUpdate() {
  // console.log('HMR Handler: Starting update for client-side.js');
  runClientSideReset();

  // Ensure mocks are ready for the script evaluation
  currentClientSideApply = null; // Clear refs before eval
  currentClientSideReset = null;
  setupMockSalesforceInteractions();
  setupMockRegisterTemplate(); // Ensure window.registerTemplate mock (deferred version) exists

  // 4. Fetch the updated script content using an ABSOLUTE URL
  const viteOrigin = new URL(import.meta.url).origin;
  const scriptPath = '/src/campaign/client-side.js';
  const scriptUrl = `${viteOrigin}${scriptPath}?t=${Date.now()}`;

  console.log(`HMR Handler: Fetching ${scriptUrl}...`);
  try {
    const response = await fetch(scriptUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch script from ${scriptUrl}: ${response.status} ${response.statusText}`);
    }
    const scriptContent = await response.text();
    console.log('HMR Handler: Fetched script content.');

    // Execute the new script content using eval
    // console.log('HMR Handler: Evaluating new client-side.js content...');
    eval(scriptContent); // This should run the IIFE and call the mock registerTemplate
    // console.log('HMR Handler: Evaluation complete.');

    // Verify registration and EXPLICITLY CALL apply
    if (typeof currentClientSideApply === 'function') {
      console.log("HMR Handler: Apply function registered successfully via eval. Explicitly calling it now...");
      runClientSideApply();
    } else {
      // If this happens, the eval or the script itself failed before calling registerTemplate
      console.error("HMR Handler: FAILED to register apply function after eval.");
    }

  } catch (e) {
    console.error("HMR Handler: Error fetching or evaluating client-side.js content:", e);
  }
}


/**
 * Sets up environment and loads/reloads the client-side script.
 * Called initially and ONLY when client-side.js itself changes.
 */
async function loadOrReloadClientScript() {
  runClientSideReset(); // Run reset (no-op first time, cleans up on subsequent calls if needed)

  currentClientSideApply = null;
  currentClientSideReset = null;

  setupMockSalesforceInteractions();

  setupMockRegisterTemplate(); // Mock is ready, but won't auto-run apply

  // --- Import ---
  // console.log('Initial Load: Dynamically importing client-side.js...');
  try {
    // @ts-ignore TS2306
    await import('./campaign/client-side.js');
    // console.log('Initial Load: client-side.js import awaited.');

    if (typeof currentClientSideApply === 'function') {
      // console.log("Initial Load: Apply function registered successfully. Explicitly calling it now...");
      runClientSideApply();
    } else {
      // This error means the IIFE didn't run or call registerTemplate correctly on initial load
      console.error("Initial Load: FAILED to register apply function after import.");
    }
  } catch (error) {
    console.error('Initial Load: Failed to load or execute client-side.js:', error);
  }
}

// --- Initial Load ---
loadOrReloadClientScript();

// --- HMR Logic ---
if (import.meta.hot) {
  console.log('HMR enabled (client-side renders/resets)');

  // HMR for Handlebars template
  import.meta.hot.accept('./campaign/template.hbs?raw', async (newModule) => { // Marked as async for await delay
    console.log('>>> HMR HANDLER: template.hbs <<<'); // Add identifier
    if (newModule) {
      console.log('HMR: template.hbs updated');
      // Recompile and store the new template function
      currentCompiledTemplateFn = Handlebars.compile(newModule.default);

      // Reset using the currently loaded script's reset function
      runClientSideReset();
      // Apply using the currently loaded script's apply function (with new template fn)
      runClientSideApply();
    } else {
      console.warn("HMR: template.hbs update received null module.");
    }
  });

  // HMR for Virtual Campaign Data
  import.meta.hot.on('campaign-data-update', async (newData: CampaignDataType) => { // Marked as async for await delay
    if (newData && JSON.stringify(newData) !== JSON.stringify(currentData)) {
      currentData = newData; // Update data

      // Reset using the currently loaded script's reset function
      runClientSideReset();
      // Apply using the currently loaded script's apply function (with new data)
      runClientSideApply();
    } else {
      console.log('HMR: Campaign data unchanged or invalid.');
    }
  });

  // HMR for Client-side JS (Simplified Handler)
  import.meta.hot.accept('./campaign/client-side.js', () => { // Pass the handler directly
    handleClientScriptHMRUpdate();
  });

  // HMR Dispose - Final Cleanup
  import.meta.hot.dispose(() => {
    // Attempt cleanup using the last known reset function
    runClientSideReset();

    // Cleanup mocks and globals
    cleanupMockSalesforceInteractions();
    if ((window as any).registerTemplate) {
      delete (window as any).registerTemplate;
      // console.log('Mock registerTemplate removed from window.');
    }
    currentClientSideApply = null;
    currentClientSideReset = null;
  });

} else {
  // This code runs if HMR is not enabled (e.g., in production build - though we aren't building)
  console.log('HMR not enabled');
}