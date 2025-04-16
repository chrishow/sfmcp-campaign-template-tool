// Example - use your actual logic
console.log("Client-side script loaded for SFMC template.");

function handleButtonClick() {
   const widget = document.querySelector('#sfmc-widget-container .my-widget');
   const emailInput = widget?.querySelector('input[type="email"]');
   if (emailInput) {
       alert(`Simulating signup for: ${emailInput.value}`);
   }
   // In real scenario, interact with Evergage/Personalization SDK
   // Maybe pass interactionName via data attribute or global scope?
   // Evergage.sendEvent({ name: widget.dataset.interactionName, ... })
}

// Export setup and cleanup functions
export function init(context) { // context can pass mock data if needed
  console.log("Initializing client-side script...");
  const widget = document.querySelector('#sfmc-widget-container .my-widget'); // Ensure selector is specific
  if (!widget) {
    console.error("Widget container not found for init");
    return;
  }

  // Add interaction name as data attribute for potential use
  if (context?.interactionName) {
      widget.dataset.interactionName = context.interactionName;
  }

  const button = widget.querySelector('button');
  if (button) {
    // Remove previous listener before adding a new one for HMR safety
    button.removeEventListener('click', handleButtonClick);
    button.addEventListener('click', handleButtonClick);
  }
}

export function cleanup() {
   console.log("Cleaning up client-side script...");
   const widget = document.querySelector('#sfmc-widget-container .my-widget');
   const button = widget?.querySelector('button');
   if (button) {
       button.removeEventListener('click', handleButtonClick);
   }
}

// --- Important ---
// Remove auto-execution based on DOMContentLoaded here,
// let main.ts control the execution via exported init.
// if (document.readyState === 'loading') { ... } else { ... } // REMOVE THIS
