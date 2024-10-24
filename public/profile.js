window.addEventListener('DOMContentLoaded', function() {
    // Load saved profile image from localStorage
    const savedImage = localStorage.getItem('profileImage');
    const profileImagePreview = document.getElementById('profileImagePreview');

    if (savedImage) {
        profileImagePreview.src = savedImage; // Set saved image if it exists
        profileImagePreview.style.display = 'block'; // Ensure image is visible
    }

    // Load saved description from localStorage
    const savedDescription = localStorage.getItem('userDescription');
    if (savedDescription) {
        document.getElementById('description').value = savedDescription;
    }

    // Load saved username from localStorage
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
        document.getElementById('username').textContent = savedUsername;
    }

    // Add click event for logout
    document.querySelector('.logout').addEventListener('click', function() {
        logoutUser();
    });

    // Add click event for deleting profile picture
    document.querySelector('.delete-pfp').addEventListener('click', function() {
        deleteProfilePicture();
    });
});

// Preview and save the new profile image
function previewProfileImage(event) {
    const profileImagePreview = document.getElementById('profileImagePreview');
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function() {
        const imageDataUrl = reader.result;
        profileImagePreview.src = imageDataUrl; // Display the new image
        profileImagePreview.style.display = 'block'; // Ensure the image is visible
        document.getElementById('profileIcon').style.display = 'none'; // Hide the default icon
        // Save the image to localStorage
        localStorage.setItem('profileImage', imageDataUrl);
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

// Save the user description to localStorage
function saveDescription() {
    const description = document.getElementById('description').value;
    localStorage.setItem('userDescription', description);
    alert('Description saved!');
}

// Logout the user
function logoutUser() {
    localStorage.clear(); // Clear all user-related data
    window.location.href = "index.html"; // Redirect to the login page
}

// Delete profile picture
function deleteProfilePicture() {
    const profileImagePreview = document.getElementById('profileImagePreview');
    profileImagePreview.src = ''; // Clear image src
    profileImagePreview.style.display = 'none'; // Hide the image
    localStorage.removeItem('profileImage'); // Remove saved image

    // Show default profile icon
    document.getElementById('profileIcon').style.display = 'block';
}

// Logout the user and redirect to the login page
function logoutUser() {
    // Clear all user-related data from localStorage
    localStorage.clear();

    // Redirect the user to the login page (index.html)
    window.location.href = "index.html";
}

// Add event listener for the logout button
document.querySelector('.logout').addEventListener('click', function() {
    logoutUser();
});
