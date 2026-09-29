// Example starter JavaScript for disabling form submissions
// if there are invalid input fields (Bootstrap validation)
(() => {

  // Enable JavaScript strict mode for safer code
  'use strict'

  // Select all forms that have the Bootstrap class "needs-validation"
  // These forms will use custom validation styles
  const forms = document.querySelectorAll('.needs-validation')

  // Convert NodeList to Array and loop through each form
  Array.from(forms).forEach(form => {

    // Add submit event listener to each form
    form.addEventListener('submit', event => {

      // checkValidity() returns false if form inputs are invalid
      if (!form.checkValidity()) {

        // Prevent the form from being submitted
        event.preventDefault()

        // Stop the event from bubbling up the DOM
        event.stopPropagation()
      }

      // Add Bootstrap class to show validation feedback
      // (green/red borders and messages)
      form.classList.add('was-validated')

    }, false)
  })

// Immediately Invoked Function Expression (IIFE)
// Runs this code automatically when the page loads
})()
