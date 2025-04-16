// src/main.ts
import './styles.css';
import Handlebars from 'handlebars';
import templateString from './template.hbs?raw';
// Import only the data object from the virtual module
import { campaignData } from 'virtual:campaign-data';
import * as clientSide from './client-side.js';

// Infer the type directly from the imported data object
type CampaignDataType = typeof campaignData;

const WIDGET_CONTAINER_ID = 'sfmc-widget-container';

let compiledTemplate = Handlebars.compile(templateString);
// Use the inferred type for the variable
let currentData: CampaignDataType = campaignData;

// Use the inferred type for the function parameter
function renderWidget(data: CampaignDataType) {
  console.log('Rendering widget with data:', data);
  currentData = data;
  let container = document.getElementById(WIDGET_CONTAINER_ID);

  if (!container) {
    console.log('Creating widget container');
    container = document.createElement('div');
    container.id = WIDGET_CONTAINER_ID;
    document.body.appendChild(container);
  }

  container.innerHTML = compiledTemplate(data);
  clientSide.init(data);
}

// Initial render
renderWidget(currentData);

// --- HMR Logic ---
if (import.meta.hot) {
  console.log('HMR enabled');

  // HMR for Handlebars template (no change needed here)
  import.meta.hot.accept('./template.hbs?raw', (newModule) => {
    if (newModule) {
      console.log('HMR: template.hbs updated');
      clientSide.cleanup();
      compiledTemplate = Handlebars.compile(newModule.default);
      renderWidget(currentData);
    }
  });

  // HMR for CSS (no change needed here)

  // HMR for Client-side JS (no change needed here)
  import.meta.hot.accept('./client-side.js', (newClientSideModule) => {
    if (newClientSideModule) {
      console.log('HMR: client-side.js updated');
      clientSide.cleanup();
      newClientSideModule.init(currentData);
    }
  });

  // HMR for our virtual campaign data module
  // Use the inferred type for the incoming data
  import.meta.hot.on('campaign-data-update', (newData: CampaignDataType) => {
    console.log('HMR: Received campaign-data-update event');
    // Ensure newData is actually defined before comparing/rendering
    if (newData && JSON.stringify(newData) !== JSON.stringify(currentData)) {
      clientSide.cleanup();
      renderWidget(newData);
    } else if (!newData) {
      console.warn('HMR: Received campaign-data-update event with null/undefined data.');
    } else {
      console.log('HMR: Campaign data hasn\'t changed.');
    }
  });

  // HMR dispose hook (no change needed here)
  import.meta.hot.dispose(() => {
    clientSide.cleanup();
    const container = document.getElementById(WIDGET_CONTAINER_ID);
    if (container) {
      container.remove();
      console.log('Widget container removed on dispose');
    }
  });
} else {
  console.log('HMR not enabled');
}