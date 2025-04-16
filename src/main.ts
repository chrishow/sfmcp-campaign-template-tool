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

function setupMockRegisterTemplate() {
  console.log('Setting up mock window.registerTemplate (client-side renders/resets)');
  type TemplateDefinition = {
    apply: (context: CampaignDataType, templateFn: CompiledTemplateFn) => void;
    reset: (context: CampaignDataType, template?: any) => void;
    control: (context: CampaignDataType) => void;
  };

  (window as any).registerTemplate = (definition: TemplateDefinition) => {
    console.log('Mock registerTemplate called.');
    // Store the functions FIRST
    currentClientSideApply = definition.apply;
    currentClientSideReset = definition.reset;

    // Try to execute APPLY immediately after it's registered
    if (currentClientSideApply && typeof currentClientSideApply === 'function') {
      console.log('Executing client-side apply function immediately after register...');
      try {
        // Pass context and the *currently compiled* template function
        currentClientSideApply(currentData, currentCompiledTemplateFn);
      } catch (error) {
        console.error('Error executing initial client-side apply function:', error);
        // Optional: Add specific error hints if needed
        if (error instanceof TypeError && error.message.includes('parameter 1 is not of type \'Node\'')) {
          console.warn("Hint: client-side.js's apply function might need adjustment. It received an HTML string from Handlebars but tried to appendChild. Consider using element.innerHTML = htmlString; on a container or ensuring template function returns a Node.");
        }
      }
    } else {
      // This case should ideally not happen if client-side.js is correct
      console.warn('client-side.js did not provide a valid apply function on register.');
    }

    // Log if reset was stored
    if (currentClientSideReset && typeof currentClientSideReset === 'function') {
      console.log('Stored client-side reset function.');
    }
    // We ignore definition.control in the mock
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
function delay(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Sets up environment and loads/reloads the client-side script.
 * Called initially and ONLY when client-side.js itself changes.
 */
async function loadOrReloadClientScript() {
  console.log('loadOrReloadClientScript called.');

  runClientSideReset();
  // *** KEEP THE INCREASED DELAY ***
  await delay(50); // Try 50ms, adjust if needed
  console.log('Delay after reset complete.');

  currentClientSideApply = null;
  currentClientSideReset = null;
  setupMockSalesforceInteractions();
  setupMockRegisterTemplate();

  console.log('Dynamically importing client-side.js...');
  try {
    // @ts-ignore TS2306
    await import('./campaign/client-side.js'); // NO Cache busting
    console.log('client-side.js import awaited.');
    // Check if registration worked
    if (typeof currentClientSideApply === 'function') {
      console.log("Apply function seems to have been registered successfully.");
      // We could potentially call runClientSideApply() here IF the mock doesn't do it
      // But let's stick to the mock doing it initially for now.
    } else {
      console.error("FAILED to register apply function after import. IIFE likely didn't run or registerTemplate failed.");
    }
  } catch (error) {
    console.error('Failed to load or execute client-side.js:', error);
  }
}

// --- Initial Load ---
loadOrReloadClientScript();

// --- HMR Logic ---
if (import.meta.hot) {
  console.log('HMR enabled (client-side renders/resets)');

  // HMR for Handlebars template
  import.meta.hot.accept('./campaign/template.hbs?raw', async (newModule) => { // Marked as async for await delay
    if (newModule) {
      console.log('HMR: template.hbs updated');
      // Recompile and store the new template function
      currentCompiledTemplateFn = Handlebars.compile(newModule.default);

      // Reset using the currently loaded script's reset function
      runClientSideReset();
      // Delay slightly to ensure DOM removal completes
      await delay(50); // Using 50ms, adjust if needed
      console.log('HMR (template): Delay after reset complete.');
      // Apply using the currently loaded script's apply function (with new template fn)
      runClientSideApply();
    } else {
      console.warn("HMR: template.hbs update received null module.");
    }
  });

  // HMR for Virtual Campaign Data
  import.meta.hot.on('campaign-data-update', async (newData: CampaignDataType) => { // Marked as async for await delay
    console.log('HMR: Received campaign-data-update');
    if (newData && JSON.stringify(newData) !== JSON.stringify(currentData)) {
      currentData = newData; // Update data

      // Reset using the currently loaded script's reset function
      runClientSideReset();
      // Delay slightly to ensure DOM removal completes
      await delay(50); // Using 50ms, adjust if needed
      console.log('HMR (data): Delay after reset complete.');
      // Apply using the currently loaded script's apply function (with new data)
      runClientSideApply();
    } else {
      console.log('HMR: Campaign data unchanged or invalid.');
    }
  });

  // HMR for Client-side JS (Simplified Handler)
  import.meta.hot.accept('./campaign/client-side.js', () => {
    console.log('HMR: client-side.js updated. Triggering reload script (no eval).');
    // Simply call the function that handles reset, delay, mock setup, and import.
    // This relies on the import within loadOrReloadClientScript triggering the IIFE
    // and the subsequent registerTemplate call.
    loadOrReloadClientScript(); // This is async but we don't need to await it here
  });

  // HMR Dispose - Final Cleanup
  import.meta.hot.dispose(() => {
    console.log('HMR: Disposing module...');
    // Attempt cleanup using the last known reset function
    runClientSideReset();

    // Cleanup mocks and globals
    cleanupMockSalesforceInteractions();
    if ((window as any).registerTemplate) {
      delete (window as any).registerTemplate;
      console.log('Mock registerTemplate removed from window.');
    }
    currentClientSideApply = null;
    currentClientSideReset = null;
  });

} else {
  // This code runs if HMR is not enabled (e.g., in production build - though we aren't building)
  console.log('HMR not enabled');
}