function validateForm() {
    var formData = {
        profile_name: document.getElementById("name").value,
        profile_location: document.getElementById("location").value,
        profile_phone: document.getElementById("phone").value,
        user_email: document.getElementById("email").value,
        profile_jobcred: document.getElementById("credentials").value,
        resume: document.getElementById("resume").value // For demonstration; this won't give you the actual file, but the file name
    };

    // Email validation
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    // Phone number validation 
    var phoneRegex = /^[0-9]+$/;
    if (!formData.phone.match(phoneRegex)) {
        alert("Please enter a valid phone number (numbers only).");
        return false;
    }

   // send data to database
   var isDataSent = sendprofile(formData)
   if (isDataSent) {
   // Display success message
   alert('Profile is posted successfully');
} else {
   // Handle the case where data sending failed
   alert('Failed to post job. Please try again.');
}
};

// Function to send job listing data to the backend
async function sendprofile(formData) {
   const url = 'https://itse-2374-app-3-back.onrender.com/post_profile'; 
   try {
       const response = await fetch(url, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json'
           },
           body: JSON.stringify(formData)
       });

       if (response.ok) {
           // Data sent successfully
           return true;
       } else {
           // Data sending failed
           return false;
       }
   } catch (error) {
       console.error('Error sending job listing data:', error);
       return false; // Return false in case of any errors
   }
}

