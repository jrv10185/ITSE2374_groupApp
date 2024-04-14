// Function to validate form inputs and trigger email confirmation
async function validateForm(event) {
    event.preventDefault(); // Prevent default form submission behavior

    let isValid = true;

  

    // Validate email
    let email = document.getElementById('email').value;
    let emailError = document.getElementById('emailError');
    let emailPattern = /^[\w.\-]+@[\w.\-]+\.[a-zA-Z]+$/;

    if (email === "" || !emailPattern.test(email)) {
        isValid = false;
        emailError.innerHTML = 'Please enter a valid email.';
        emailError.style.color = 'red';
    } else {
        emailError.innerHTML = '';
    }
}


document.getElementById('email').addEventListener('submit', validateForm);