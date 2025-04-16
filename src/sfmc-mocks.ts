// src/sfmc-mocks.ts

/**
 * Sets up mock implementations for SalesforceInteractions and related globals.
 */
export function setupMockSalesforceInteractions() {
    console.log('Setting up mock SalesforceInteractions from sfmc-mocks.ts...');

    // --- Mock Implementations ---

    // src/sfmc-mocks.ts

    const mockCashDom = (selector: string) => {
        // Log when cashDom itself is called
        console.log(`SFMC MOCK: cashDom("${selector}") called.`);
        // Query elements *at the time cashDom is called*
        const elementsAtCallTime = Array.from(document.querySelectorAll(selector));
        console.log(`SFMC MOCK: cashDom found ${elementsAtCallTime.length} element(s) for selector "${selector}" initially.`);

        return {
            elements: elementsAtCallTime, // Store elements found initially
            length: elementsAtCallTime.length,

            append: (htmlString: string) => {
                console.log(`SFMC MOCK: cashDom("${selector}").append() called.`);
                const targetElements = Array.from(document.querySelectorAll(selector)); // Query again for append target
                if (targetElements.length > 0) {
                    console.log(`SFMC MOCK: Appending to first element found for "${selector}":`, targetElements[0]);
                    targetElements[0].insertAdjacentHTML('beforeend', htmlString);
                } else {
                    console.warn(`SFMC MOCK: cashDom("${selector}").append(): No elements found to append to.`);
                }
            },

            remove: () => {
                // Query again *at the exact time remove() is called*
                const elementsToRemove = Array.from(document.querySelectorAll(selector));
                console.log(`SFMC MOCK: cashDom("${selector}").remove() called. Found ${elementsToRemove.length} element(s) to remove.`);
                if (elementsToRemove.length > 0) {
                    elementsToRemove.forEach((el, index) => {
                        console.log(`SFMC MOCK: Removing element ${index} [${selector}]:`, el);
                        el.remove(); // Perform removal
                    });
                    console.log(`SFMC MOCK: Finished removing elements for "${selector}".`);

                    // *** Add Verification Log Immediately After Removal Attempt ***
                    const elementsAfterRemove = Array.from(document.querySelectorAll(selector));
                    console.log(`SFMC MOCK: Verification - Elements found for "${selector}" immediately after remove call: ${elementsAfterRemove.length}`);

                } else {
                    console.warn(`SFMC MOCK: cashDom("${selector}").remove(): No elements found to remove.`);
                }
            },
        };
    };

    // ... rest of sfmc-mocks.ts (setup/cleanup functions) ...

    const mockDisplayUtils = {
        unbind: (bindId: string) => {
            console.log(`Mock SalesforceInteractions.DisplayUtils.unbind("${bindId}")`);
        },
    };

    const mockSendEvent = (eventPayload: any) => {
        console.log('Mock SalesforceInteractions.sendEvent called with:', eventPayload);
    };

    const mockBuildBindId = (context: any) => {
        console.log('Mock buildBindId called with context:', context);
        const mockId = `mock-bind-id::${context?.campaign?.experienceId ?? 'unknown'}`;
        console.log(`Mock buildBindId returning: "${mockId}"`);
        return mockId;
    };

    // --- Assign to Window ---

    (window as any).SalesforceInteractions = {
        cashDom: mockCashDom,
        sendEvent: mockSendEvent,
        DisplayUtils: mockDisplayUtils,
    };

    (window as any).buildBindId = mockBuildBindId;

    console.log('Mock SalesforceInteractions setup complete.');
}

/**
 * Cleans up the mock objects from the window global scope.
 */
export function cleanupMockSalesforceInteractions() {
    console.log('Cleaning up mock SalesforceInteractions from window...');
    let cleaned = false;
    if ((window as any).SalesforceInteractions) {
        delete (window as any).SalesforceInteractions;
        cleaned = true;
    }
    if ((window as any).buildBindId) {
        delete (window as any).buildBindId;
        cleaned = true;
    }
    if (cleaned) {
        console.log('Mock SalesforceInteractions cleanup complete.');
    } else {
        console.log('No mock SalesforceInteractions found on window to clean up.');
    }
}