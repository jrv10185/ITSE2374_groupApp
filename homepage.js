console.log('Script loaded and running.');
const createJobButton = document.getElementById('createJobButton');

createJobButton.addEventListener('click', function () {
    console.log('Button clicked.');
    window.location.href = 'create_job_listing.html';
});
