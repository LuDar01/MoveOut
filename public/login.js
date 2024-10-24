document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const identifier = document.getElementById('username_or_email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error_message');

    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
    });

    const data = await response.json();

    if (response.status === 200) {
        alert('Login successful!');
        localStorage.setItem('username', data.username);
        window.location.href = "/profile.html";
    } else {
        errorMessage.textContent = data.message;
    }
});
