require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const nodemailer = require('nodemailer'); // Import nodemailer for sending emails
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = process.env.PORT || 3000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 50, // Maximum number of connections in the pool
    min: 2, // Minimum number of connections in the pool
    idleTimeoutMillis: 2147483647, // Time in milliseconds after which idle connections are closed
    connectionTimeoutMillis: 2147483647,
    ssl: {
        rejectUnauthorized: false
    }
});

// SMTP configuration for Outlook
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, // Use environment variable for email username
        pass: process.env.EMAIL_PASSWORD // Use environment variable for email password
    }
});

// Endpoint for sending email confirmation and storing user information in temporary table
app.post('/register', async (req, res) => {
    // Extract registration data from the request body
    const { user_name, user_type, user_email, user_password } = req.body;

    try {
        // Generate a random key for email verification
        const verificationKey = generateVerificationKey();

        // Store user information in the temporary table
        await storeInTemporaryTable(user_name, user_type, user_email, user_password, verificationKey);

        // Send email with verification link
        await sendVerificationEmail(user_email, verificationKey);

        // Respond with success message and redirect back to the group login page
        res.status(200).json({ message: 'Registration email sent successfully.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'An error occurred while registering user.' });
    }
});

// Endpoint to post job listing
app.post('/post_job', async (req, res) => {
    // Extract registration data from the request body
    const { user_name, listing_name, listing_location, listing_category, listing_desc, listing_salary, listing_start_date, listing_status } = req.body;

    try {
        // Generate a random key for email verification
        const listing_number = generateVerificationKey();
        const listing_status = 'Posted';

        // Store user information in the temporary table
        await storeInJobListing(listing_number, user_name, listing_name, listing_location, listing_category, listing_desc, listing_salary, listing_start_date, listing_status);

        // Respond with success message and redirect back to the group login page
        res.status(200).json({ message: 'Job Posted successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'An error occurred while posting job.' });
    }
});

// Endpoint for confirming registration
app.get('/confirm-registration', async (req, res) => {
    const { key } = req.query;

    try {
        // Retrieve user information from the temporary table using the verification key
        const userData = await getUserFromTemporaryTable(key);

        if (userData) {
            // Move user information to the permanent table
            await moveUserToPermanentTable(userData);

            // Remove user information from the temporary table
            await removeFromTemporaryTable(key);

            // Respond with success message
           // res.status(200).json({ message: 'Registration confirmed successfully.' });
            //redirect
            res.redirect('https://itse-2374-app-3-front.onrender.com/login');
        } else {
            // If no user found with the provided key, respond with error message
            res.status(404).json({ error: 'Invalid verification key.' });
        }
    } catch (error) {
        console.error('Error confirming registration:', error);
        res.status(500).json({ error: 'An error occurred while confirming registration.' });
    }
});

// Endpoint for user login
app.post('/validate_login', async (req, res) => {
    const { user_email, user_password } = req.body;

    try {
        // Check if the user exists in the permanent table
        const user = await getUserFromPermanentTable(user_email);

        if (user && user.user_password === user_password) {
            // User authenticated successfully
            res.status(200).json({ message: 'Login successful.' });
        } else {
            // Invalid credentials
            res.status(401).json({ error: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

// Endpoint to add job listing
app.post('/add_job_listing', async (req, res) => {
    const jobListingData = req.body;
    const verificationKey = generateVerificationKey();

    try {
        // Execute the database query to insert data into the database based on the user's email
        // Example:
        await insertJobListingIntoDatabase(jobListingData,verificationKey);

        // Respond with success message
        res.status(200).json({ message: 'Job listing added successfully.' });
    } catch (error) {
        console.error('Error adding job listing:', error);
        res.status(500).json({ error: 'An error occurred while adding job listing.' });
    }
});

app.post('/post_profile', async (req, res) => {
    const profileData = req.body;

    try {
        // Execute the database query to insert data into the database based on the user's email
        await insertProfileIntoDatabase(profileData); //change this

        // Respond with success message
        res.status(200).json({ message: 'Job listing added successfully.' });
    } catch (error) {
        console.error('Error adding job listing:', error);
        res.status(500).json({ error: 'An error occurred while adding job listing.' });
    }
});

// Function to insert job listing data into the database
async function insertProfileIntoDatabase(profileData) {
    // Your database query to insert data into the database based on the user's email
      const query = `
        INSERT INTO "ITSE-2374-APP-3"."PROFILE" (user_name, profile_name,profile_location, profile_phone, profile_jobcred)
        VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
        profileData.user_email,
        profileData.profile_name,
        profileData.profile_location,
        profileData.profile_phone,
        profileData.user.email,
        profileData.profile_jobcred
    ];
    await pool.query(query, values);
}

// Function to insert job listing data into the database
async function insertJobListingIntoDatabase(jobListingData,listing_number) {
    // Your database query to insert data into the database based on the user's email
      const query = `
        INSERT INTO "ITSE-2374-APP-3"."LISTING" (listing_number, user_name, listing_name, listing_location, listing_category, listing_desc, listing_salary, listing_start_date, listing_status, user_email)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [
        listing_number,
        jobListingData.user_name,
        jobListingData.listing_name,
        jobListingData.listing_location,
        jobListingData.listing_category,
        jobListingData.listing_desc,
        jobListingData.listing_salary,
        jobListingData.listing_start_date,
        jobListingData.listing_status,
        jobListingData.user_email
    ];
    await pool.query(query, values);
}

// Function to store user information in the temporary table
async function storeInTemporaryTable(user_name, user_type, user_email, user_password, token) {
    const query = `
        INSERT INTO "ITSE-2374-APP-3"."USER_UNVERIFIED" (user_name, user_type, user_email, user_password, token)
        VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [user_name, user_type, user_email, user_password, token];
    await pool.query(query, values);
}

// Function to send verification email
async function sendVerificationEmail(email, verificationKey) {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Your Outlook email address
        to: email,
        subject: 'Confirm Your Registration',
        html: `
            <p>Thank you for registering!</p>
            <p>Please click the following link to confirm your registration:</p>
            <a href="https://itse-2374-app-3-back.onrender.com/confirm-registration?key=${verificationKey}">Confirm Registration</a>
        `
    };
    try {
        // Send email with verification link
        await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        transporter.close();
        // Handle error
    } finally {
        // Close the connection to the SMTP server
        transporter.close();
    }
}

// Function to retrieve user information from the temporary table using the verification key
async function getUserFromTemporaryTable(verificationKey) {
    const query = `
        SELECT * FROM "ITSE-2374-APP-3"."USER_UNVERIFIED" WHERE token = $1
    `;
    const values = [verificationKey];
    const result = await pool.query(query, values);
    return result.rows[0]; // Assuming there's only one user with the provided key
}

// Function to retrieve user information from the temporary table using the verification key
async function getUserFromPermanentTable(user_email) {
    const query = `SELECT user_email, user_password FROM "ITSE-2374-APP-3"."USER" WHERE user_email = $1`;

    const values = [user_email];
    const result = await pool.query(query, values);
    return result.rows[0]; // Assuming there's only one user with the provided key
}

// Function to move user information to the permanent table
async function moveUserToPermanentTable(userData) {
    const { user_name, user_type, user_email, user_password } = userData;
    const query = `
        INSERT INTO "ITSE-2374-APP-3"."USER" (user_name, user_type, user_email, user_password)
        VALUES ($1, $2, $3, $4)
    `;
    const values = [user_name, user_type, user_email, user_password];
    await pool.query(query, values);
}

// Function to remove user information from the temporary table
async function removeFromTemporaryTable(verificationKey) {
    const query = `
        DELETE FROM "ITSE-2374-APP-3"."USER_UNVERIFIED" WHERE token = $1
    `;
    const values = [verificationKey];
    await pool.query(query, values);
}

// Function to generate a random verification key
function generateVerificationKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

//function to post a job listing, 
async function storeInJobListing(listing_number, user_name, listing_name, listing_location, listing_category, listing_desc, listing_salary, listing_start_date, listing_status) {
    const query = `
        INSERT INTO "ITSE-2374-APP-3"."LISTING" (listing_number, user_name, listing_name, listing_location, listing_category, listing_desc, listing_salary, listing_start_date, listing_status)
        VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [listing_number, user_name, listing_name, listing_location, listing_category, listing_desc, listing_salary, listing_start_date, listing_status];
    await pool.query(query, values);
}

// Start the server to listen for HTTP requests
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

