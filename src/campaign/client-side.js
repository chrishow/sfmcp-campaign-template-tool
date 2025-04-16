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


    }

    function apply(context, template) {
        // if (!context.contentZone) return;

        if (SalesforceInteractions.cashDom(".mcp-2025-04-09-popup").length > 0) return;

        const html = template(context);
        SalesforceInteractions.cashDom("body").append(html);
        setupForm();
    }

    function reset(context, template) {
        SalesforceInteractions.DisplayUtils.unbind(buildBindId(context));
        SalesforceInteractions.cashDom(".mcp-2025-04-09-popup").remove();
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

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();
