// src/sfmc-mocks.ts

/**
 * Sets up mock implementations for SalesforceInteractions and related globals.
 */
export function setupMockSalesforceInteractions() {
    console.log('Setting up mock SalesforceInteractions from sfmc-mocks.ts...');

    // --- Mock Implementations ---

    const mockCashDom = (selector: string) => {
        console.log(`Mock SalesforceInteractions.cashDom("${selector}")`);
        const elements = Array.from(document.querySelectorAll(selector));
        return {
            elements: elements,
            length: elements.length,
            append: (htmlString: string) => {
                console.log(`Mock cashDom("${selector}").append(...)`);
                if (elements.length > 0) {
                    elements[0].insertAdjacentHTML('beforeend', htmlString);
                } else {
                    console.warn(`Mock cashDom("${selector}") found no elements to append to.`);
                }
            },
            remove: () => {
                console.log(`Mock cashDom("${selector}").remove()`);
                elements.forEach(el => el.remove());
            },
            // Add other mock methods as needed (on, addClass, etc.)
        };
    };

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