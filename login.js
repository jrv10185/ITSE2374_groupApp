$(document).ready(function() {
    $("#submit").click(async function() {
        $("span").text(""); // clear any previous error messages
        let isValid = true; // initialize isValid flag

        const email = $("#email").val();
        const password = $("#password").val();

        if (email === "" || !email.match(/^[\w\.\-]+@[\w\.\-]+\.[a-zA-Z]+$/)) {
            isValid = false;
            $("#email").next().text("Please enter a valid email.");
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
        if (password === "" || !password.match(passwordRegex)) {
            isValid = false;
            $("#password").next().text("Password must be between 8 and 20 characters, and include at least one uppercase letter, one lowercase letter, and one number.");
        }

        const validCredentials = await checkCredentials(email, password);

        if (!validCredentials) {
            isValid = false;
            $("span.message").text("Login Failed: Invalid username or password.");
        }
        if (validCredentials){
            console.log("Validated");
        }


        if (isValid) {
            // Save profile info to session storage
            sessionStorage.setItem("email", email);
        
            
            // Navigate to profile.html
            window.location.href = "home.html"; // Specify the actual profile.html URL
        }

        $("#email").focus();
    });

    $("#cancel").click(() => {
        // Clear input fields
        $("#email").val("");
        $("#password").val("");
        // Clear error messages
        $("span").text("");
        // Set focus to the email field
        $("#email").focus();
    });

    // set focus on initial load
    $("#email").focus();
});

// Function to check login credentials by sending a POST request to the server
async function checkCredentials(user_email, user_password) {
    const url = 'https://itse-2374-app-3-back.onrender.com/validate_login'; // Change the port if your server is running on a different port
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_email, user_password })
        });

        if (response.ok) {
            // Login successful, return true
            return true;
        } else {
            // Login failed, return false
            return false;
        }
    } catch (error) {
        console.error('Error checking credentials:', error);
        return false; // Return false in case of any errors
    }
}