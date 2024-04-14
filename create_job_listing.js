document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('registrationForm');
    var userName = sessionStorage.getItem('email');
    var employerName = document.getElementById('employer_name');
        var location = document.getElementById('location');
        var category = document.getElementById('category');
        var description = document.getElementById('description');
        var salaryRange = document.getElementById('salary_range');
        var startDate = document.getElementById('startDate');

    form.addEventListener('submit', function (event) {
        if (!validateForm(event)) {
            event.preventDefault();
        }
    });

    async function validateForm(event) {


        // Remove previous validation messages
       // clearValidationMessages();

        // Simple check for non-empty values
        if (employerName.value.trim() === '') {
            showValidationMessage(employerName, 'Employer name is required');
            return false;
        }

        if (location.value.trim() === '') {
            showValidationMessage(location, 'Location is required');
            return false;
        }

        if (category.value === '') {
            showValidationMessage(category, 'Category is required');
            return false;
        }

        if (description.value.trim() === '') {
            showValidationMessage(description, 'Description is required');
            return false;
        }

        if (salaryRange.value === '') {
            showValidationMessage(salaryRange, 'Salary Range is required');
            return false;
        }

        if (startDate.value === '') {
            showValidationMessage(startDate, 'Start Date is required');
            return false;
        }

        

        return true; // Form is valid
    }

    function showValidationMessage(inputElement, message) {
        var validationMessage = document.createElement('span');
        validationMessage.className = 'validation-message';
        validationMessage.textContent = message;
        validationMessage.style.color = 'red';

        inputElement.parentNode.appendChild(validationMessage);
    }

    function clearValidationMessages() {
        var validationMessages = document.querySelectorAll('.validation-message');
        validationMessages.forEach(function (message) {
            message.parentNode.removeChild(message);
        });
    }

    let jobListingData = {
        user_email: userName,
        listing_name: employerName,
        listing_location: location,
        listing_category: category,
        listing_desc: description,
        listing_salary:salaryRange,
        listing_start_date:startDate,
        listing_status: 'Posted'
    };

    // send data to database
    var isDataSent = sendjoblisting(jobListingData)
    if (isDataSent) {
    // Display success message
    alert('Job is posted successfully');
} else {
    // Handle the case where data sending failed
    alert('Failed to post job. Please try again.');
}
});

// Function to send job listing data to the backend
async function sendjoblisting(jobListingData) {
    const url = 'https://itse-2374-app-3-back.onrender.com/add_job_listing'; 
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobListingData)
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
