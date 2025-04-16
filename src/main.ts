import './styles.css'; // Vite handles CSS injection + HMR
import Handlebars from 'handlebars'; // Import Handlebars runtime
import templateString from './template.hbs?raw'; // Import HBS as raw string
import { mockData, MockDataType } from './mock-data.ts'; // Import mock data
import * as clientSide from './client-side.js'; // Import client-side logic

const WIDGET_CONTAINER_ID = 'sfmc-widget-container';

// Compile the Handlebars template
// Do this *outside* render so it's not recompiled unnecessarily
let compiledTemplate = Handlebars.compile(templateString);

// Function to render the widget
function renderWidget(data: MockDataType) {
  console.log('Rendering widget with data:', data);
  let container = document.getElementById(WIDGET_CONTAINER_ID);

  // Create container if it doesn't exist (important for injection)
  if (!container) {
    console.log('Creating widget container');
    container = document.createElement('div');
    container.id = WIDGET_CONTAINER_ID;
    document.body.appendChild(container);
  }

  // Render the template into the container
  container.innerHTML = compiledTemplate(data);

  // Initialize client-side JS logic *after* rendering
  // Pass context if needed (e.g., interactionName)
  clientSide.init(data);
}

// Initial render
renderWidget(mockData);

// --- HMR Logic ---
if (import.meta.hot) {
  console.log('HMR enabled');

  // HMR for Handlebars template
  import.meta.hot.accept('./template.hbs?raw', (newModule) => {
    if (newModule) {
       console.log('HMR: template.hbs updated');
       // Cleanup old client-side listeners before re-rendering
       clientSide.cleanup();
       // Re-compile template and re-render
       compiledTemplate = Handlebars.compile(newModule.default);
       renderWidget(mockData); // Re-render with current mock data
    }
  });

  // HMR for CSS is handled automatically by Vite via the import

  // HMR for Mock Data
  import.meta.hot.accept('./mock-data.ts', (newMockDataModule) => {
     if (newMockDataModule) {
        console.log('HMR: mock-data.ts updated');
        // Cleanup old client-side listeners before re-rendering
        clientSide.cleanup();
         // Re-render with new data
        renderWidget(newMockDataModule.mockData);
     }
  });

  // HMR for Client-side JS
  import.meta.hot.accept('./client-side.js', (newClientSideModule) => {
    if (newClientSideModule) {
        console.log('HMR: client-side.js updated');
        // Cleanup old listeners/state if necessary
        clientSide.cleanup();
        // Re-initialize the new module's logic
        newClientSideModule.init(mockData); // Use current mock data
    }
  });

   // Cleanup when main.ts itself is disposed (e.g. full reload)
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
