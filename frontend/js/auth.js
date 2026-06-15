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

// LOAD PROFILE DETAILS
async function loadProfile() {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileSummaryName = document.getElementById('profileSummaryName');
    const profileSummaryIcon = document.getElementById('profileSummaryIcon');

    if (!profileName || !profileEmail) return;

    checkAuth();

    try {
        const response = await apiRequest('/auth/profile');
        const user = response.user;

        profileName.value = user.name || '';
        profileEmail.value = user.email || '';

        if (profileSummaryName) {
            profileSummaryName.innerText = user.name || 'User';
        }

        if (profileSummaryIcon) {
            profileSummaryIcon.innerText = user.name ? user.name.charAt(0) : 'U';
        }

        localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
        alert('Failed to load profile: ' + err.message);
    }
}

// UPDATE NAME AND EMAIL
const editProfileForm = document.getElementById('editProfileForm');

if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;

        try {
            const response = await apiRequest('/auth/profile', 'PUT', {
                name,
                email
            });

            localStorage.setItem('user', JSON.stringify(response.user));

            document.getElementById('profileErrorBox').classList.add('hidden');

            alert('Profile updated successfully');
            loadProfile();
        } catch (err) {
            
            const profileErrorBox = document.getElementById('profileErrorBox');
            const profileErrorMessage = document.getElementById('profileErrorMessage');

            profileErrorMessage.innerText = err.message;
            profileErrorBox.classList.remove('hidden');
            
        }
    })
}

// CANCEL PROFILE UPDATE
const cancelProfileBtn = document.getElementById('cancelProfileBtn');

if (cancelProfileBtn) {
    cancelProfileBtn.addEventListener('click', () => {
        document.getElementById('profileErrorBox').classList.add('hidden');
        loadProfile();
    });
}

// VERIFY OLD PASSWORD BEFORE ALLOWING PASSWORD CHANGE
const verifyPasswordBtn = document.getElementById('verifyPasswordBtn');

if (verifyPasswordBtn) {
    verifyPasswordBtn.addEventListener('click', async () => {
        const oldPassword = document.getElementById('oldPassword').value;

        if (!oldPassword) {
            alert('Please enter your old password');
            return;
        }

        try {
            await apiRequest('/auth/verify-password', 'POST', {
                oldPassword
            });

            alert('Password verified');

            document.getElementById('changePasswordErrorBox').classList.add('hidden');
            document.getElementById('errorMessage').innerText = '';

            document.getElementById('newPasswordSection').classList.remove('hidden');
            document.getElementById('verifyPasswordBtn').classList.add('hidden');
            document.getElementById('oldPassword').readOnly = true;
        } catch (err) {
            alert('Verification failed: ' + err.message);
        }
    });
}

// UPDATE PASSWORD
const changePasswordForm = document.getElementById('changePasswordForm');

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        const changePasswordErrorBox = document.getElementById("changePasswordErrorBox");
        const errorMessage = document.getElementById("errorMessage");

        if (!passwordFormat.test(newPassword)) {
            errorMessage.innerText = "⚠️ Password must include uppercase, lowercase, number, symbol and be at least 8 characters.";
            changePasswordErrorBox.classList.remove("hidden");
            return;
        }

        if (!newPassword || !confirmPassword) {
            alert('Please enter and confirm your new password');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        try {
            await apiRequest('/auth/password', 'PUT', {
                oldPassword,
                newPassword
            });

            alert('Password updated successfully');

            document.getElementById('oldPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';

            document.getElementById('oldPassword').readOnly = false;
            document.getElementById('newPasswordSection').classList.add('hidden');
            document.getElementById('verifyPasswordBtn').classList.remove('hidden');
        } catch (err) {
            alert('Password update failed: ' + err.message);
        }
    });
}

// RESET PASSWORD FORM WHEN CANCEL IS CLICKED
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');

if (cancelPasswordBtn) {
    cancelPasswordBtn.addEventListener('click', () => {
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        document.getElementById('changePasswordErrorBox').classList.add('hidden');
        document.getElementById('errorMessage').innerText = '';

        document.getElementById('oldPassword').readOnly = false;
        document.getElementById('newPasswordSection').classList.add('hidden');
        document.getElementById('verifyPasswordBtn').classList.remove('hidden');
    });
}

if (document.getElementById('editProfileForm')) {
    loadProfile();
}

const forgotPasswordForm = document.getElementById('forgotPasswordForm');

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;

        const email = document.getElementById('email').value;

        try {
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;

            const response = await apiRequest('/auth/forgot-password', 'POST', {
                email
            });

            alert("📩 Reset link has been sent to your email!");

            // optional UX improvement
            forgotPasswordForm.reset();

        } catch (err) {
            alert("⚠️ " + err.message);
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
}