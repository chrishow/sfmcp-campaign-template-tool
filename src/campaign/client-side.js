(function () {

    function uuidv4() {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
            (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
    }

    function setupForm() {
        const container = document.querySelector('.mcp-2025-04-09-popup');
        const form = container.querySelector('form.mcp-form');
        const forenameField = form.querySelector('input[name="firstName"]');
        const emailField = form.querySelector('input[name="emailAddress"]');
        const overlay = document.querySelector('.mcp-overlay');

        function doFormSubmit() {
            form.classList.add('submitted');
            // Create user object 
            const newUser = {
                attributes: {
                    firstName: forenameField.value,
                    emailAddress: emailField.value,
                    sfmcContactKey: uuidv4(),
                }
            };

            console.log("User data submitted:", newUser);

            // Send the data to the server
            SalesforceInteractions.sendEvent({
                interaction: {
                    name: container.dataset.interactionName,
                },
                user: newUser
            });

            // Show the thank you message
            container.classList.add('show-thank-you');
            setTimeout(() => {
                container.classList.add('hide-form');
            }, 600);
        }

        const submitButton = form.querySelector('input[type="submit"]');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            submitButton.setAttribute('disabled', 'true');

            doFormSubmit();
        });

        // Manage dismissal
        [
            overlay,
            ...document.querySelectorAll('.dismiss-btn'),
        ].forEach((element) => {
            element.addEventListener('click', () => {
                container.remove();
            });
        });

        // add target=_blank to all links in the small copy
        const smallCopyLinks = container.querySelectorAll('.small a');
        if (smallCopyLinks) {
            smallCopyLinks.forEach((link) => {
                link.setAttribute('target', '_blank');
            });
        }

        // console.log("###########Form setup complete.");
    }

    // src/campaign/client-side.js
    function apply(context, template) {
        console.log("client-side.js: apply executed");

        const html = template(context);
        // Use cashDom mock for consistency if desired, or stick to direct append
        SalesforceInteractions.cashDom("body").append(html);
        console.log("client-side.js: HTML appended to body.");

        setTimeout(() => {
            console.log("client-side.js: Deferred execution started.");
            // Check for existence *inside* the timeout, just before setup
            // Use plain querySelectorAll for direct DOM check here
            const currentPopups = document.querySelectorAll(".mcp-2025-04-09-popup");
            console.log(`client-side.js: Found ${currentPopups.length} popups inside setTimeout.`);

            if (currentPopups.length > 1) {
                console.error("Popup duplication detected inside setTimeout!");
                // Maybe try removing all but the last one?
                // for (let i = 0; i < currentPopups.length - 1; i++) { currentPopups[i].remove(); }
                // console.warn("Attempted to remove duplicate popups.");
                setupForm(); // Try setting up the last one anyway?
            } else if (currentPopups.length === 0) {
                console.error("Popup not found inside setTimeout! Append likely failed or was removed.");
            } else {
                // Length is 1 - This is the expected state
                console.log("Single popup confirmed inside setTimeout. Proceeding with setupForm.");
                setupForm();
            }
        }, 100); // Start with 0ms delay for the timeout, increase if needed
    }

    function reset(context, template) {
        SalesforceInteractions.DisplayUtils.unbind(buildBindId(context));
        SalesforceInteractions.cashDom(".mcp-2025-04-09-popup").remove();
        console.log('Removing popup');
        // if (context.contentZone) {
    }

    function control(context) {
        // return SalesforceInteractions.DisplayUtils
        //     .bind(buildBindId(context))
        //     .pageExit(pageExitMillis)
        //     .then(() => {
        //         // if (context.contentZone) return true;
        //         return true;
        //     });
    }
    console.log("Client-side.js: >>> Reached point just before registerTemplate call <<<"); // <-- ADD THIS LOG

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();
