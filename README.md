



## Insert script into live page:

```
(function() {
  const scriptId = 'mcp-vite-dev-script';
  // Check if script already injected to prevent duplicates on manual re-runs
  if (document.getElementById(scriptId)) {
     document.getElementById(scriptId).remove();
     return;
  }
  const script = document.createElement('script');
  script.id = scriptId;
  script.type = 'module';
  script.src = 'http://localhost:5173/src/main.ts'; // <--- Make sure this matches your vite url
  document.body.appendChild(script);
  console.log('Injected Vite dev script: /src/main.ts');
})();
```