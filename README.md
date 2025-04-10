# Salesforce Marketing Cloud Personalization Campaign Template development environment


This tool massively speeds up development of Salesforce Marketing Cloud Personalization (sfMCP) Campaign Templates.

It allows you to develop Campaign Templates locally with `less` compilation and hot module reload. 

## Quick start

1. Clone the repo
2. run `npm install`
3. run `npm run dev`
4. Open the vite link shown in your terminal in your browser

You can now edit the files in the 'files' directory and they will be compiled and hot-reloaded in your browser window. No more copying and pasting into the 'visual editor'. 

You can also test your client-side code without having to upload everything to the server. 

## Installing your templates
Once you have finished editing your files locally, you need to upload them to sfMCP. It would be great if there was an API for this, but there isn't, so it's a (small) manual step. 

Use the supplied `npm run build` script which does the following:

1. Compiles `sfMCP-files/styles.less` to `sfMCP-files/styles.css`
2. Builds a json export file suitable for import into the visual editor
3. Copies the json into the (Mac) clipboard with `pbcopy`
3. Deletes the `sfMCP-files/styles.css` file

(If you are not using `less` or a Mac, you will want to modify this.)

You can now use the 'Import template from clipboard' button in the Campaign Template visual editor. 

## Extra info
There is some basic mocking of the sfMCP environment and tools in `src/salesforce-mocks.js`. I have only mocked the functions I need, if you need more, raise an issue. 

Your input files go in the `sfMCP-files` directory. They should be named as in supplied files, the export tool will rename them to be the same filename as required by the import tool. 

If your server-side classname isn't `MyCampaignTemplate` (it probably isn't if you've copied it from the visual editor), you will need to change the import and classname in `src/main.ts`. 