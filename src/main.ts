declare var Handlebars: any;

import './global-decorators';
import { MyCampaignTemplate } from '../sfMCP-files/server-side';
import templateString from '../sfMCP-files/template.hbs?raw';

const templateData = new MyCampaignTemplate;
// console.log(templateData);


const event = new CustomEvent('mcpTemplateReady', {
    detail: {
        templateData,
        templateString
    }
});
window.dispatchEvent(event);

