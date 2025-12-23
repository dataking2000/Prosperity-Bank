// Authentication JavaScript
class Auth {
    constructor() {
        this.currentUser = null;
        this.initialize();
    }

    initialize() {
        this.checkAuthStatus();
        this.setupAuthForms();
        this.setupPasswordReset();
    }

    checkAuthStatus() {
        const userData = localStorage.getItem('bankUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUIForLoggedInUser();
        }
    }

    updateUIForLoggedInUser() {
        // Update login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.textContent = 'Sign Out';
            loginBtn.onclick = () => this.logout();
        }

        // Update user menu
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            const userName = userMenu.querySelector('.user-name');
            if (userName) {
                userName.textContent = this.currentUser.name;
            }
        }

        // Show dashboard link
        const dashboardLink = document.getElementById('dashboardLink');
        if (dashboardLink) {
            dashboardLink.classList.remove('hidden');
        }
    }

    login(email, password) {
        // Demo users
        const users = [
            { 
                id: 1,
                email: 'user@example.com', 
                password: 'password123', 
                name: 'Alex Johnson',
                phone: '(555) 123-4567',
                address: '123 Main St, New York, NY 10001'
            },
            { 
                id: 2,
                email: 'test@bank.com', 
                password: 'test123', 
                name: 'Test User',
                phone: '(555) 987-6543',
                address: '456 Park Ave, Chicago, IL 60601'
            }
        ];

        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('bankUser', JSON.stringify(user));
            this.updateUIForLoggedInUser();
            
            // Show success message
            this.showNotification('Successfully logged in!', 'success');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'pages/dashboard.html';
            }, 1000);
            
            return true;
        } else {
            this.showNotification('Invalid email or password', 'error');
            return false;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('bankUser');
        
        // Update UI
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.textContent = 'Sign In';
            loginBtn.onclick = () => this.showLoginModal();
        }
        
        const userMenu = document.getElementById('userMenu');
        if (userMenu) {
            userMenu.classList.add('hidden');
        }
        
        const dashboardLink = document.getElementById('dashboardLink');
        if (dashboardLink) {
            dashboardLink.classList.add('hidden');
        }
        
        this.showNotification('Successfully logged out', 'success');
        
        // Redirect to home if on protected page
        if (window.location.pathname.includes('dashboard') || 
            window.location.pathname.includes('accounts') ||
            window.location.pathname.includes('transfers')) {
            window.location.href = '../index.html';
        }
    }

    setupAuthForms() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = loginForm.querySelector('[type="email"]').value;
                const password = loginForm.querySelector('[type="password"]').value;
                this.login(email, password);
            });
        }

        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.signup(signupForm);
            });
        }
    }

    signup(form) {
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());
        
        // Validate data
        if (!this.validateSignupData(userData)) {
            return false;
        }
        
        // Create user object
        const newUser = {
            id: Date.now(),
            email: userData.email,
            password: userData.password,
            name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone || '',
            address: userData.address || '',
            ssn: userData.ssn,
            accountNumber: userData.accountNumber,
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const existingUsers = JSON.parse(localStorage.getItem('bankUsers') || '[]');
        existingUsers.push(newUser);
        localStorage.setItem('bankUsers', JSON.stringify(existingUsers));
        
        // Auto login
        this.currentUser = newUser;
        localStorage.setItem('bankUser', JSON.stringify(newUser));
        
        this.showNotification('Account created successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'pages/dashboard.html';
        }, 1500);
        
        return true;
    }

    validateSignupData(data) {
        // Check required fields
        const required = ['firstName', 'lastName', 'email', 'password', 'ssn', 'accountNumber'];
        for (const field of required) {
            if (!data[field]?.trim()) {
                this.showNotification(`${field} is required`, 'error');
                return false;
            }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }
        
        // Password strength
        if (data.password.length < 8) {
            this.showNotification('Password must be at least 8 characters', 'error');
            return false;
        }
        
        // SSN format
        const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
        if (!ssnRegex.test(data.ssn)) {
            this.showNotification('Please enter a valid SSN', 'error');
            return false;
        }
        
        return true;
    }

    setupPasswordReset() {
        const resetForm = document.getElementById('resetPasswordForm');
        if (resetForm) {
            resetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.resetPassword(resetForm);
            });
        }
    }

    resetPassword(form) {
        const email = form.querySelector('[type="email"]').value;
        
        // Simulate password reset
        this.showNotification('Password reset instructions sent to your email', 'success');
        
        setTimeout(() => {
            form.reset();
            // Hide reset form
            const resetContainer = document.getElementById('resetPasswordContainer');
            if (resetContainer) {
                resetContainer.classList.add('hidden');
            }
        }, 2000);
    }

    showLoginModal() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Sign In to Online Banking</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="modalLoginForm">
                    <div class="form-group">
                        <label class="form-label">Online ID</label>
                        <input type="email" class="form-control" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-control" placeholder="Enter your password" required>
                    </div>
                    <div class="form-group">
                        <label class="checkbox">
                            <input type="checkbox"> Remember Online ID
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Sign In</button>
                </form>
                <div class="modal-footer">
                    <p><a href="#" onclick="auth.showResetPassword()">Forgot Online ID or Password?</a></p>
                    <p>Don't have an account? <a href="#" onclick="auth.showSignupModal()">Enroll now</a></p>
                </div>
            </div>
        `;
        
        document.getElementById('modalOverlay').style.display = 'flex';
        
        // Setup form
        const loginForm = document.getElementById('modalLoginForm');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('[type="email"]').value;
            const password = loginForm.querySelector('[type="password"]').value;
            this.login(email, password);
        });
    }

    showSignupModal() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Enroll in Online Banking</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="modalSignupForm">
                    <div class="form-group">
                        <label class="form-label">First Name</label>
                        <input type="text" name="firstName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Last Name</label>
                        <input type="text" name="lastName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" name="email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input type="tel" name="phone" class="form-control" placeholder="(555) 123-4567">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Social Security Number</label>
                        <input type="text" name="ssn" class="form-control" placeholder="XXX-XX-XXXX" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Account Number</label>
                        <input type="text" name="accountNumber" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Create Password</label>
                        <input type="password" name="password" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Confirm Password</label>
                        <input type="password" name="confirmPassword" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Continue Enrollment</button>
                </form>
            </div>
        `;
        
        document.getElementById('modalOverlay').style.display = 'flex';
        
        const signupForm = document.getElementById('modalSignupForm');
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Check password match
            const password = signupForm.querySelector('[name="password"]').value;
            const confirmPassword = signupForm.querySelector('[name="confirmPassword"]').value;
            
            if (password !== confirmPassword) {
                this.showNotification('Passwords do not match', 'error');
                return;
            }
            
            this.signup(signupForm);
        });
    }

    showResetPassword() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;
        
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Reset Password</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="modalResetForm">
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" class="form-control" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Social Security Number</label>
                        <input type="text" class="form-control" placeholder="XXX-XX-XXXX" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Account Number</label>
                        <input type="text" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Reset Password</button>
                </form>
                <div class="modal-footer">
                    <p>Remembered your password? <a href="#" onclick="auth.showLoginModal()">Back to login</a></p>
                </div>
            </div>
        `;
        
        document.getElementById('modalOverlay').style.display = 'flex';
        
        const resetForm = document.getElementById('modalResetForm');
        resetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showNotification('Password reset instructions sent to your email', 'success');
            setTimeout(() => {
                document.getElementById('modalOverlay').style.display = 'none';
            }, 2000);
        });
    }

    showNotification(message, type = 'info') {
        if (typeof bankWebsite !== 'undefined') {
            bankWebsite.showNotification(message, type);
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            this.showNotification('Please sign in to access this page', 'error');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
            return false;
        }
        return true;
    }
}

// Initialize auth
window.auth = new Auth();