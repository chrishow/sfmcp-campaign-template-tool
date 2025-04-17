// src/sfmc-mocks.ts

/**
 * Sets up mock implementations for SalesforceInteractions and related globals.
 */
export function setupMockSalesforceInteractions() {
    console.log('Setting up mock SalesforceInteractions from sfmc-mocks.ts...');

    // --- Mock Implementations ---

    // src/sfmc-mocks.ts

    const mockCashDom = (selector: string | Element) => { // Allow Element as input too, though likely string now
        let elements: Element[] = [];
        let selectorString: string = '';

        // Determine if input is selector string or element
        if (typeof selector === 'string') {
            selectorString = selector;
            console.log(`SFMC MOCK: cashDom("${selectorString}") called.`);
            elements = Array.from(document.querySelectorAll(selectorString));
        } else if (selector instanceof Element) {
            // If an element is passed directly (less likely with current pageElementLoaded mock)
            selectorString = `Passed Element <${selector.tagName}>`;
            console.log(`SFMC MOCK: cashDom(Element) called with:`, selector);
            elements = [selector]; // Treat the passed element as the collection
        } else {
            console.error(`SFMC MOCK: cashDom called with invalid type:`, selector);
            selectorString = 'Invalid Selector';
            elements = [];
        }

        console.log(`SFMC MOCK: cashDom processing ${elements.length} element(s) for selector/element "${selectorString}".`);

        return {
            elements: elements, // Expose the found elements
            length: elements.length,

            append: (htmlString: string) => {
                console.log(`SFMC MOCK: cashDom("${selectorString}").append() called.`);
                if (elements.length > 0) {
                    // Append to the first element found by the original selector/element
                    console.log(`SFMC MOCK: Appending to first element:`, elements[0]);
                    elements[0].insertAdjacentHTML('beforeend', htmlString);
                } else {
                    console.warn(`SFMC MOCK: cashDom("${selectorString}").append(): No elements found initially to append to.`);
                }
            },

            remove: () => {
                console.log(`SFMC MOCK: cashDom("${selectorString}").remove() called. Found ${elements.length} element(s) to remove.`);
                if (elements.length > 0) {
                    elements.forEach((el, index) => {
                        console.log(`SFMC MOCK: Removing element ${index} [${selectorString}]:`, el);
                        el.remove();
                    });
                    console.log(`SFMC MOCK: Finished removing elements for "${selectorString}".`);
                    // Verification log (optional but useful)
                    // const elementsAfterRemove = typeof selector === 'string' ? Array.from(document.querySelectorAll(selector)) : [];
                    // console.log(`SFMC MOCK: Verification - Elements found immediately after remove call: ${elementsAfterRemove.length}`);
                } else {
                    console.warn(`SFMC MOCK: cashDom("${selectorString}").remove(): No elements found initially to remove.`);
                }
            },

            // *** ADD THE .html() METHOD ***
            html: (htmlString: string): void => { // Typically takes HTML string, returns void or 'this' for chaining
                console.log(`SFMC MOCK: cashDom("${selectorString}").html() called.`);

                if (elements.length > 0) {
                    console.log(`SFMC MOCK: Setting innerHTML for ${elements.length} element(s) found for "${selectorString}".`);
                    // Usually, html() replaces content only on the FIRST element in cash-dom/jQuery
                    // Adjust if SFMC's cashDom behaves differently
                    console.log(`SFMC MOCK: Setting innerHTML for first element:`, elements[0]);
                    elements[0].innerHTML = htmlString; // Set innerHTML on the first element
                } else {
                    // Log a warning if no elements were found initially by cashDom
                    console.warn(`SFMC MOCK: cashDom("${selectorString}").html(): No elements found initially to set HTML for.`);
                }
                // Note: Return 'this' (the object itself) if chaining is needed, e.g., .html(...).addClass(...)
                // return this;
            }
        };
    };

    /**
     * Mock for SalesforceInteractions.DisplayUtils.pageElementLoaded
     * Returns a Promise that resolves with the TARGET SELECTOR STRING when the element is found.
     */
    const mockPageElementLoaded = (
        targetSelector: string,
        observerSelector?: string
    ): Promise<string> => {
        // Basic validation (remains the same)
        if (!targetSelector || typeof targetSelector !== 'string') {
            console.error("SFMC MOCK: DisplayUtils.pageElementLoaded: targetSelector is required and must be a string.");
            return Promise.reject(new Error("Invalid targetSelector provided to pageElementLoaded mock."));
        }
        if (observerSelector && typeof observerSelector !== 'string') {
            console.warn("SFMC MOCK: DisplayUtils.pageElementLoaded: observerSelector provided but is not a string. Ignoring it.");
            observerSelector = undefined;
        }

        return new Promise((resolve, reject) => {
            console.log(`SFMC MOCK: DisplayUtils.pageElementLoaded searching for "${targetSelector}"...`);

            // 1. Check if the element already exists
            const existingElement = document.querySelector(targetSelector);
            if (existingElement) {
                console.log(`SFMC MOCK: DisplayUtils.pageElementLoaded found "${targetSelector}" immediately. Resolving with SELECTOR.`);
                resolve(targetSelector);
                return; // Promise resolved
            }

            // 2. If not found, set up a MutationObserver
            console.log(`SFMC MOCK: DisplayUtils.pageElementLoaded: Element "${targetSelector}" not present. Setting up observer.`);

            const observerCallback = (mutationsList: MutationRecord[], observer: MutationObserver) => {
                const foundElement = document.querySelector(targetSelector);
                if (foundElement) {
                    console.log(`SFMC MOCK: DisplayUtils.pageElementLoaded found "${targetSelector}" after DOM mutation. Resolving with SELECTOR.`);
                    observer.disconnect(); // Stop observing once found
                    resolve(targetSelector);  // Resolve the promise with the selector string
                }
            };

            const observer = new MutationObserver(observerCallback);

            // Determine the node to observe (remains the same)
            let observerNode: Node | null = null;
            if (observerSelector) {
                observerNode = document.querySelector(observerSelector);
                if (!observerNode) {
                    console.warn(`SFMC MOCK: DisplayUtils.pageElementLoaded: observerSelector "${observerSelector}" not found. Falling back to observing document.body.`);
                    observerNode = document.body;
                } else {
                    console.log(`SFMC MOCK: DisplayUtils.pageElementLoaded observing within specific element:`, observerNode);
                }
            } else {
                observerNode = document.body;
                console.log(`SFMC MOCK: DisplayUtils.pageElementLoaded observing document.body.`);
            }

            const config: MutationObserverInit = { childList: true, subtree: true };
            observer.observe(observerNode, config);
            console.log(`SFMC MOCK: Observer started on`, observerNode);
        });
    };


    const mockDisplayUtils = {
        unbind: (bindId: string) => {
            console.log(`Mock SalesforceInteractions.DisplayUtils.unbind("${bindId}")`);
        },
        pageElementLoaded: mockPageElementLoaded,
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
        getContentZoneSelector: (zoneSelector: string) => {
            return zoneSelector; // Return a default selector
        }
    };

    (window as any).buildBindId = mockBuildBindId;

    // console.log('Mock SalesforceInteractions setup complete.');
}

/**
 * Cleans up the mock objects from the window global scope.
 */
export function cleanupMockSalesforceInteractions() {
    // console.log('Cleaning up mock SalesforceInteractions from window...');
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