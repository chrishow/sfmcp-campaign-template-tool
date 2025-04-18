/**
 * Sets up mock implementations for SalesforceInteractions and related globals
 * needed for local development and testing outside the SFMC environment.
 */
export function setupMockSalesforceInteractions() {

    // --- Mock Implementations ---

    /**
     * Mock implementation of SalesforceInteractions.cashDom (similar to jQuery/cash-dom).
     * @param selector - A CSS selector string or an existing Element.
     */
    const mockCashDom = (selector: string | Element) => {
        let elements: Element[] = [];
        let selectorString: string = ''; // For logging/warning purposes

        if (typeof selector === 'string') {
            selectorString = selector;
            try {
                elements = Array.from(document.querySelectorAll(selectorString));
            } catch (e) {
                console.error(`SFMC MOCK: cashDom failed to query selector "${selectorString}":`, e);
                elements = []; // Ensure elements is empty on error
            }
        } else if (selector instanceof Element) {
            selectorString = `Passed Element <${selector.tagName}>`;
            elements = [selector]; // Treat the passed element as the collection
        } else {
            console.error(`SFMC MOCK: cashDom called with invalid type:`, selector);
            selectorString = 'Invalid Selector';
            elements = [];
        }

        // Return the mock cashDom object
        return {
            elements: elements, // Expose the found elements if needed externally
            length: elements.length,

            /** Appends HTML to the first element in the collection. */
            append: (htmlString: string) => {
                if (elements.length > 0) {
                    elements[0].insertAdjacentHTML('beforeend', htmlString);
                } else {
                    console.warn(`SFMC MOCK: cashDom("${selectorString}").append(): No elements found to append to.`);
                }
            },

            /** Removes all elements in the collection from the DOM. */
            remove: () => {
                if (elements.length > 0) {
                    elements.forEach(el => el.remove());
                } else {
                    console.warn(`SFMC MOCK: cashDom("${selectorString}").remove(): No elements found to remove.`);
                }
            },

            /** Sets the innerHTML of the first element in the collection. */
            html: (htmlString: string): void => {
                if (elements.length > 0) {
                    // Standard behavior is to affect only the first element
                    elements[0].innerHTML = htmlString;
                } else {
                    console.warn(`SFMC MOCK: cashDom("${selectorString}").html(): No elements found to set HTML for.`);
                }
            }
            // Add other cashDom methods here if needed (e.g., .addClass, .attr, etc.)
        };
    };

    /**
     * Mock for SalesforceInteractions.DisplayUtils.pageElementLoaded.
     * Returns a Promise that resolves with the *target selector string* when the element is found.
     * @param targetSelector - The CSS selector for the element to wait for.
     * @param observerSelector - Optional CSS selector for a container element to observe mutations within. Defaults to document.body.
     */
    const mockPageElementLoaded = (
        targetSelector: string,
        observerSelector?: string
    ): Promise<string> => {
        // --- Input Validation ---
        if (!targetSelector || typeof targetSelector !== 'string') {
            const errorMsg = "SFMC MOCK: DisplayUtils.pageElementLoaded: targetSelector is required and must be a string.";
            console.error(errorMsg);
            return Promise.reject(new Error(errorMsg)); // Reject promise on invalid input
        }
        if (observerSelector && typeof observerSelector !== 'string') {
            console.warn("SFMC MOCK: DisplayUtils.pageElementLoaded: observerSelector provided but is not a string. Ignoring it.");
            observerSelector = undefined; // Clear invalid observer selector
        }

        // --- Promise Logic ---
        return new Promise((resolve) => {
            // 1. Check if the element already exists
            const existingElement = document.querySelector(targetSelector);
            if (existingElement) {
                resolve(targetSelector); // Resolve immediately with the selector string
                return;
            }

            // 2. If not found, set up a MutationObserver
            const observerCallback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
                // Check if the target element exists *anywhere* in the document now
                if (document.querySelector(targetSelector)) {
                    observer.disconnect(); // Stop observing once found
                    resolve(targetSelector);  // Resolve the promise with the selector string
                }
            };

            const observer = new MutationObserver(observerCallback);

            // Determine the node to observe
            let observerNode: Node = document.body; // Default to body
            if (observerSelector) {
                const specificNode = document.querySelector(observerSelector);
                if (specificNode) {
                    observerNode = specificNode;
                } else {
                    console.warn(`SFMC MOCK: DisplayUtils.pageElementLoaded: observerSelector "${observerSelector}" not found. Falling back to observing document.body.`);
                    // Keep observerNode as document.body
                }
            }

            // Configuration for the observer (observe additions/removals in the subtree)
            const config: MutationObserverInit = { childList: true, subtree: true };
            observer.observe(observerNode, config);
        });
    };


    /** Mock DisplayUtils object */
    const mockDisplayUtils = {
        unbind: (bindId: string) => {
            // console.log(`SFMC MOCK: DisplayUtils.unbind("${bindId}") called.`); // Keep commented for potential debugging
        },
        pageElementLoaded: mockPageElementLoaded,
    };

    /** Mock sendEvent function */
    const mockSendEvent = (eventPayload: any) => {
        // console.log('SFMC MOCK: sendEvent called with:', eventPayload); // Keep commented for potential debugging
    };

    /** Mock buildBindId function */
    const mockBuildBindId = (context: any) => {
        // Simple mock ID generation, mimicking potential real-world structure
        const experienceId = context?.campaign?.experienceId ?? 'unknown_experience';
        const mockId = `mock-bind-id::${experienceId}`;
        // console.log(`SFMC MOCK: buildBindId called, returning: "${mockId}"`, context); // Keep commented for potential debugging
        return mockId;
    };

    // --- Assign Mocks to Window ---

    (window as any).SalesforceInteractions = {
        cashDom: mockCashDom,
        sendEvent: mockSendEvent,
        DisplayUtils: mockDisplayUtils,
        // Mock basic getContentZoneSelector behavior - usually just returns the input
        getContentZoneSelector: (zoneSelector: string) => zoneSelector,
    };

    (window as any).buildBindId = mockBuildBindId;

} // *** End of setupMockSalesforceInteractions ***


/**
 * Cleans up the mock objects from the window global scope.
 */
export function cleanupMockSalesforceInteractions() {
    let foundMocks = false;
    if ((window as any).SalesforceInteractions) {
        delete (window as any).SalesforceInteractions;
        foundMocks = true;
    }
    if ((window as any).buildBindId) {
        delete (window as any).buildBindId;
        foundMocks = true;
    }

    if (!foundMocks) {
        // Log only if cleanup was called but nothing was found (might indicate an issue or just expected state)
        console.log('SFMC MOCK: No mock SalesforceInteractions found on window to clean up.');
    }
}
