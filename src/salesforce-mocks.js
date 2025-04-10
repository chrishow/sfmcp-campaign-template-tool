var __templateObject;
var __templateData;
var __templateString;


function compileTemplate() {
    const compiledTemplate = Handlebars.compile(__templateString);
    const html = compiledTemplate(__templateData);
    return html;
}

function registerTemplate(templateObject) {
    __templateObject = templateObject;

    // Template will be 'apply'-ed when the mcpTemplateReady event is fired
}


/*
    * Mocking the SalesforceInteractions object
    * This is a placeholder for the actual SalesforceInteractions object
*/
var SalesforceInteractions = {
    cashDom: $,
    sendEvent: function (event) {
        console.log("Event sent:", event);
    },
};

window.addEventListener('mcpTemplateReady', function (event) {
    // console.log("mcpTemplateReady event received", event);
    __templateData = event.detail.templateData;
    __templateString = event.detail.templateString;
    __templateObject.apply(window.templateData, compileTemplate);
});