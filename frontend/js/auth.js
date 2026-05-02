const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Get elements and values
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        // 2. VALIDATE PASSWORD
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        const errorBox = document.getElementById("errorBox");
        const errorMessage = document.getElementById("errorMessage");

        if (!passwordPattern.test(password)) {
            errorMessage.innerText = "⚠️ Password must include uppercase, lowercase, number, symbol and be at least 8 characters.";
            errorBox.classList.remove("hidden");
            return;
        }

        // 3. THE LOGIC CHECK (Frontend Only)
        // We do this BEFORE calling the API or changing button state
        if (password !== passwordConfirm) {
            alert("❌ Passwords do not match! Please check again.");
            document.getElementById('passwordConfirm').focus(); // Guide the user
            return; // STOP everything here
        }

        // 4. API Call Setup
        try {
            submitBtn.innerText = "Creating Account...";
            submitBtn.disabled = true;

            // Only send name, email, and password (matches your existing schema)
            const response = await apiRequest('/auth/register', 'POST', {
                name,
                email,
                password
            });

            if (response.token) {
                localStorage.setItem('token', response.token);
                window.location.href = 'login.html';
                alert("Account created successfully! Please log in.");
            }
        } catch (err) {
            // This handles Mongoose errors (like duplicate email or password too short)
            alert("⚠️ Registration Error: " + err.message);
        } finally {
            // Always reset the button
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const credentials = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        // Inside your loginForm event listener in js/auth.js
        try {
            const response = await apiRequest('/auth/login', 'POST', credentials);
            
            // Check where the user object is hiding!
            // Try response.data.user first, if not, try response.user
            const userData = (response.data && response.data.user) ? response.data.user : response.user;
            const token = response.token;

            if (token && userData) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                window.location.href = 'dashboard.html';
                alert("Login successfully!"); 
            } else {
                alert('Login failed: Invalid response from server');
            }
        } catch (err) {
            alert('Login Failed: ' + err.message);
        }
    });
}

// --- SHOW & HIDE PASSWORD ---
function togglePassword(password, eyeIcon) {
    const input = document.getElementById(password);
    const icon = document.getElementById(eyeIcon);

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

// --- LOGOUT LOGIC ---
function logout() {
    // 1. Ask for confirmation
    const confirmLogout = confirm("Are you sure you want to log out?");

    // 2. Only proceed if they clicked "OK"
    if (confirmLogout) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        alert("Logged out successfully!"); 
        
        window.location.href = 'login.html';
    }
}

// --- PROTECT PRIVATE PAGES ---
// Run this on dashboard.html, create-trip.html, etc.
function checkAuth() {
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }
}