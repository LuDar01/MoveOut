document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error_message');

    // Simple password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
        errorMessage.textContent = 'Password must be at least 6 characters long with uppercase, lowercase, and a number.';
        return;
    }

    // Regex to match any email containing 'gmail' in the domain, regardless of TLD (.com, .se, etc.)
    const gmailRegex = /@gmail\./i;

    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
    });

    const data = await response.json();
    if (response.status === 200) {
        if (gmailRegex.test(email)) {
            alert('Registration successful! You can log in without verification.');
        } else {
            alert('Registration successful! Please check your email for verification.');
        }
        // Redirect to login
        window.location.href = "index.html";
    } else {
        errorMessage.textContent = data.message;
    }
});
