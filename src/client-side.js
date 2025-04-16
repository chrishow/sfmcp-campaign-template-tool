(function () {


  function setupButton() {
    const button = document.querySelector('#sfmc-widget-container button');
    console.log('button', button);

    button.addEventListener('click', (event) => {
      event.preventDefault();
      alert('button clicked!');
    });

  }

  function apply(context, template) {
    // 1. Call the compiled template function to get the HTML STRING
    const htmlString = template(context);

    // 2. Create a container element
    const container = document.createElement('div');
    container.id = 'sfmc-widget-container'; // Make sure it has the ID reset expects

    // 3. Set the innerHTML of the container using the string
    container.innerHTML = htmlString;

    // 4. Append the CONTAINER element to the body
    document.body.appendChild(container); // Appending the DIV element now

    // 5. DEFER Setup listeners targeting elements WITHIN the new container
    console.log('DOM appended. Deferring setupButton slightly.');
    // Use setTimeout with 0 delay to push execution to the end of the current event loop cycle
    setTimeout(() => {
      console.log('Executing deferred setupButton.');
      setupButton();
    }, 0);
  }


  function reset(context, template) {
    // remove the widget
    console.error('client-side.js: reset function called.');
    document.querySelector('#sfmc-widget-container').remove();
  }

  function control(context) {
    // We don't need to implement this
  }

  registerTemplate({
    apply: apply,
    reset: reset,
    control: control
  });

})();
