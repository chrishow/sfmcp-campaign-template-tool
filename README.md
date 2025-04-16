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

Or use this bookmarklet link: <a href="javascript:(function()%7B(function()%20%7B%0A%20%20const%20scriptId%20%3D%20'mcp-vite-dev-script'%3B%0A%20%20%2F%2F%20Check%20if%20script%20already%20injected%20to%20prevent%20duplicates%20on%20manual%20re-runs%0A%20%20if%20(document.getElementById(scriptId))%20%7B%0A%20%20%20%20%20alert('Script%20already%20injected!')%3B%0A%20%20%20%20%20return%3B%0A%20%20%7D%0A%20%20const%20script%20%3D%20document.createElement('script')%3B%0A%20%20script.id%20%3D%20scriptId%3B%0A%20%20script.type%20%3D%20'module'%3B%0A%20%20%2F%2F%20Make%20sure%20this%20matches%20your%20vite%20url!%0A%20%20script.src%20%3D%20'http%3A%2F%2Flocalhost%3A5173%2Fsrc%2Fmain.ts'%3B%20%0A%20%20document.body.appendChild(script)%3B%0A%20%20console.log('Injected%20Vite%20dev%20script%3A%20%2Fsrc%2Fmain.ts')%3B%0A%7D)()%3B%7D)()%3B">Inject</a>. You can drag this link to your bookmarks bar for easy access. 

You can now edit the files in the 'campaign' directory and they will be compiled and hot-reloaded in your browser window. No more copying and pasting into the 'visual editor'. 

You can also test your client-side code without having to upload everything to the server. 

## Installing your templates
Once you have finished editing your files locally, you need to upload them to sfMCP. It would be great if there was an API for this, but there isn't, so it's a (small) manual step. 

Use the supplied `npm run build` script which does the following:

1. Compiles `campaign/styles.less` to `campaign/styles.css`
2. Builds a json export file suitable for import into the visual editor
3. Copies the json into the (Mac) clipboard with `pbcopy`
3. Deletes the `campaign/styles.css` file

(If you are not using `less` or a Mac, you will want to modify this.)

You can now use the 'Import template from clipboard' button in the Campaign Template visual editor. 

## Extra info
There is some basic mocking of the sfMCP environment and tools in `src/sfmc-mocks.js`. I have only mocked the functions I need, if you need more, raise an issue. 

Your input files go in the `campaign` directory. They should be named as in supplied files, the export tool will rename them to be the same filename as required by the import tool. 
