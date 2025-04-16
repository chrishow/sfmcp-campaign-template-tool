// src/main.ts
import './campaign/styles.less';
import Handlebars from 'handlebars';
import templateString from './campaign/template.hbs?raw';
import { campaignData } from 'virtual:campaign-data';

// Import the mock setup and cleanup functions
import { setupMockSalesforceInteractions, cleanupMockSalesforceInteractions } from './sfmc-mocks'; // <-- IMPORT

type CampaignDataType = typeof campaignData;
// Type for the compiled Handlebars template function
type CompiledTemplateFn = (context: any) => string; // Handlebars compile returns a function that yields a string

// --- Global state ---
let currentData: CampaignDataType = campaignData;
const WIDGET_CONTAINER_ID = 'sfmc-widget-container'; // Client-side script uses this ID

// Compile the initial template and store the function
let currentCompiledTemplateFn: CompiledTemplateFn = Handlebars.compile(templateString);

// Store the functions provided by client-side.js
let currentClientSideApply: ((context: CampaignDataType, templateFn: CompiledTemplateFn) => void) | null = null;
let currentClientSideReset: ((context: CampaignDataType, template?: any) => void) | null = null; // Store reset


// --- Mock SFMC SDK ---
/**
 * Defines the mock 'registerTemplate' function on the window object.
 */
function setupMockRegisterTemplate() {
  console.log('Setting up mock window.registerTemplate (client-side renders/resets)');
  type TemplateDefinition = {
    // Apply now receives context and the COMPILED template function
    apply: (context: CampaignDataType, templateFn: CompiledTemplateFn) => void;
    reset: (context: CampaignDataType, template?: any) => void;
    control: (context: CampaignDataType) => void;
  };

  (window as any).registerTemplate = (definition: TemplateDefinition) => {
    console.log('Mock registerTemplate called.');

    // Store the provided functions
    currentClientSideApply = definition.apply;
    currentClientSideReset = definition.reset;

    if (currentClientSideApply && typeof currentClientSideApply === 'function') {
      console.log('Executing client-side apply function immediately after register...');
      try {
        // Pass context and the *currently compiled* template function
        currentClientSideApply(currentData, currentCompiledTemplateFn);
      } catch (error) {
        console.error('Error executing initial client-side apply function:', error);
        // Check if the error is related to appendChild expecting a Node vs String
        if (error instanceof TypeError && error.message.includes('parameter 1 is not of type \'Node\'')) {
          console.warn("Hint: client-side.js's apply function might need adjustment. It received an HTML string from Handlebars but tried to appendChild. Consider using element.innerHTML = htmlString; on a container.");
        }
      }
    } else {
      console.warn('client-side.js did not provide a valid apply function.');
    }

    if (typeof currentClientSideReset === 'function') {
      console.log('Stored client-side reset function.');
    }
    // Ignore control
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
 * Sets up environment and loads/reloads the client-side script.
 * Called initially and ONLY when client-side.js itself changes.
 */
async function loadOrReloadClientScript() {
  console.log('loadOrReloadClientScript called.');

  // --- Cleanup from PREVIOUS script version ---
  // If a *previous* version of the script was loaded, its reset function
  // should be stored. Run it now before loading the new script.
  runClientSideReset();

  // Clear stored function references from the previous script version
  currentClientSideApply = null;
  currentClientSideReset = null;

  // Ensure mock is ready BEFORE importing the new script
  setupMockSalesforceInteractions();
  setupMockRegisterTemplate();

  console.log('Dynamically importing client-side.js...');
  try {
    // Import the script. It will execute its IIFE, call registerTemplate,
    // which the mock captures, storing the NEW apply/reset and running the NEW apply.
    // @ts-ignore TS2306 - Suppressing spurious module error for non-module IIFE script
    await import('./campaign/client-side.js');
    console.log('client-side.js imported and executed.');
  } catch (error) {
    console.error('Failed to load or execute client-side.js:', error);
    // Maybe add a visual indicator on the page?
    document.body.insertAdjacentHTML('beforeend', '<p style="color: red; position: fixed; bottom: 0; right: 0; background: white; border: 1px solid red; padding: 5px; z-index: 10000;">Error loading client script!</p>');
  }
}

// --- Initial Load ---
loadOrReloadClientScript();

// --- HMR Logic ---
if (import.meta.hot) {
  console.log('HMR enabled (client-side renders/resets)');

  // HMR for Handlebars template
  import.meta.hot.accept('./campaign/template.hbs?raw', (newModule) => {
    if (newModule) {
      console.log('HMR: template.hbs updated');
      // Recompile and store the new template function
      currentCompiledTemplateFn = Handlebars.compile(newModule.default);

      // Reset using the currently loaded script's reset function
      runClientSideReset();
      // Apply using the currently loaded script's apply function (with new template fn)
      runClientSideApply();
    }
  });

  // HMR for Virtual Campaign Data
  import.meta.hot.on('campaign-data-update', (newData: CampaignDataType) => {
    console.log('HMR: Received campaign-data-update');
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

  // HMR for Client-side JS
  import.meta.hot.accept('./campaign/client-side.js', async () => {
    console.log('HMR: client-side.js updated');
    // This requires reloading the script entirely.
    // loadOrReloadClientScript handles calling the OLD reset before loading the NEW script.
    await loadOrReloadClientScript();
  });

  // HMR Dispose - Last chance cleanup
  import.meta.hot.dispose(() => {
    console.log('HMR: Disposing module...');
    // Attempt cleanup using the last known reset function
    runClientSideReset();

    // Cleanup globals
    if ((window as any).registerTemplate) {
      delete (window as any).registerTemplate;
    }
    currentClientSideApply = null;
    currentClientSideReset = null;
  });

} else {
  console.log('HMR not enabled');
}