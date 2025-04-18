# Salesforce Marketing Cloud Personalization Campaign Template development environment


This tool massively speeds up development of Salesforce Marketing Cloud Personalization (sfMCP) Campaign Templates.

It allows you to develop Campaign Templates locally with `less` compilation and hot module reload, while injected into the live target page.

## Quick start

1. Clone the repo: `git clone https://github.com/chrishow/sfmcp-campaign-template-tool.git`
2. `cd sfmcp-campaign-template-tool`
3. run `npm install`
4. run `npm run dev`
5. Inject the code into the target page

## Injecting the code into the target page

You now need to inject the code into the target page. This is so that you can inherit all the page's styles. 

Open the target page in your browser, and you can now either paste this code into the development console:
```
(function() {
  const scriptId = 'mcp-vite-dev-script';
  // Check if script already injected to prevent duplicates on manual re-runs
  if (document.getElementById(scriptId)) {
     alert('Script already injected!');
     return;
  }
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'module';
  // Make sure this matches your vite url!
  script.src = 'http://localhost:5173/src/main.ts'; 
  document.body.appendChild(script);
  console.log('Injected Vite dev script: /src/main.ts');
})();
```

Or copy the code to this <a target='_blank' href='https://caiorss.github.io/bookmarklet-maker/'>bookmarklet maker</a> to create a bookmarklet that you can drag to your bookmarks bar for easy access. 

You can now edit the files in the 'campaign' directory and they will be compiled and hot-reloaded in your browser window. No more copying and pasting into the 'visual editor'. 

You can also test your client-side code without having to upload everything to the server. 

## Installing your templates
Once you have finished editing your files locally, you need to upload them to sfMCP. It would be great if there was an API for this, but there isn't, so it's a (small) manual step. 

Use the supplied `npm run build` script which does the following:

1. Compiles `campaign/styles.less`
2. Builds a json export file suitable for import into the visual editor
3. Copies the json into the (Mac) clipboard with `pbcopy`

(If you are not using `less` or a Mac, you will want to modify this.)

You can now use the 'Import template from clipboard' button in the Campaign Template visual editor. 

## Extra info
There is some basic mocking of the sfMCP environment and tools in `src/sfmc-mocks.js`. I have only mocked the functions I need, if you need more, raise an issue. 

Your input files go in the `campaign` directory. They should be named as in supplied files, the export tool will rename them to be the same filename as required by the import tool. 
