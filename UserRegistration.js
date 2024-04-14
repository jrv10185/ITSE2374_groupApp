// Function to validate form inputs and trigger email confirmation
async function validateForm(event) {
    event.preventDefault(); // Prevent default form submission behavior

    let isValid = true;

    // Validate name
    let userName = document.getElementById('name').value;


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

    // Validate password
    let password = document.getElementById('password').value;
    let passwordError = document.getElementById('passwordError');
    let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;

    if (password === "" || !passwordPattern.test(password)) {
        isValid = false;
        passwordError.innerHTML = 'Password must be between 8 and 20 characters, and include at least one uppercase letter, one lowercase letter, and one number.';
        passwordError.style.color = 'red';
    } else {
        passwordError.innerHTML = '';
    }

    // Validate user type (employer or job seeker)
    let userType;
    if (document.getElementById('employer').checked) {
        userType = 'employer';
    } else if (document.getElementById('job_seeker').checked) {
        userType = 'job_seeker';
    }

    // If form is valid, trigger email confirmation
    if (isValid) {
        let registrationData = {
            user_name: userName,
            user_type: userType,
            user_email: email,
            user_password: password
        };
        sendRegistrationData(registrationData);
    }
}

// Function to send registration data to temporary table
async function sendRegistrationData(registrationData) {
    const url = 'https://itse-2374-app-3-back.onrender.com/register'; 
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });
        if (response.ok) {
            console.log('Registration data sent to temporary table successfully');
            // PUT CODE TO GO TO 'CHECK EMAIL' PAGE HERE
            window.open('checkEmail.html','_self');

        } else {
            console.error('Failed to send registration data to temporary table:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending registration data to temporary table:', error);
    }
}

// Add event listener to form submission
document.getElementById('registrationForm').addEventListener('submit', validateForm);

        