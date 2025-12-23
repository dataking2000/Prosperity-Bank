/**
 * Prosperity Bank - Main JavaScript File (Server Version)
 * Complete authentication and website functionality with server backend
 */

// --- Global Constants ---
const API_BASE_URL = window.location.origin;

const STORAGE_KEYS = {
    CURRENT_USER: 'pb_currentUser',
    IS_LOGGED_IN: 'pb_isLoggedIn'
};

// --- API Helper Functions ---
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// --- User Management Functions ---
async function registerUser(userData) {
    try {
        const result = await apiCall('/api/register', 'POST', userData);
        
        if (result.success) {
            // Auto-login the new user
            await loginUser(userData.username, userData.password);
        }
        
        return result;
    } catch (error) {
        return { success: false, message: error.message };
    }
}

async function loginUser(username, password) {
    try {
        const result = await apiCall('/api/login', 'POST', { username, password });
        
        if (result.success) {
            // Store user in session storage (client-side only)
            sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(result.user));
            sessionStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
            updateNavigationState();
        }
        
        return result;
    } catch (error) {
        return { success: false, message: error.message };
    }
}

function logoutUser() {
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    sessionStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    updateNavigationState();
    
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = './index.html';
    }
}

function getCurrentUser() {
    const userStr = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
}

async function refreshCurrentUser() {
    const user = getCurrentUser();
    if (user) {
        try {
            const updatedUser = await apiCall(`/api/users/${user.id}`);
            sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
            return updatedUser;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            return user;
        }
    }
    return null;
}

function isLoggedIn() {
    return sessionStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
}

// --- Login Form Handler ---
function handleLoginFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const usernameInput = document.getElementById('userId') || document.getElementById('username');
    const passwordInput = document.getElementById('pass') || document.getElementById('password');
    
    if (!usernameInput || !passwordInput) return;
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Clear previous errors
    const existingError = form.querySelector('.auth-error');
    if (existingError) existingError.remove();
    
    // Show loading
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    submitButton.disabled = true;
    
    // Attempt login
    loginUser(username, password)
        .then(result => {
            if (result.success) {
                const successDiv = document.createElement('div');
                successDiv.className = 'alert alert-success auth-success';
                successDiv.innerHTML = '<i class="fas fa-check-circle"></i> Login successful! Redirecting...';
                form.prepend(successDiv);
                
                setTimeout(() => {
                    window.location.href = './dashboard.html';
                }, 1000);
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'alert alert-danger auth-error';
                errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${result.message}`;
                form.insertBefore(errorDiv, submitButton);
                
                passwordInput.value = '';
                passwordInput.focus();
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }
        })
        .catch(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger auth-error';
            errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Login failed. Please try again.`;
            form.insertBefore(errorDiv, submitButton);
            
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        });
}

// --- Enrollment Form Handler ---
function initEnrollment() {
    const form = document.getElementById('enrollmentForm');
    if (!form) return;
    
    let currentStep = 1;
    const totalSteps = 3;
    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'), 
        document.getElementById('step3'),
        document.getElementById('step4')
    ];
    
    const progressBarFill = document.getElementById('progressBarFill');
    const prevStepBtn = document.getElementById('prevStep');
    const nextStepBtn = document.getElementById('nextStep');
    const submitEnrollmentBtn = document.getElementById('submitEnrollment');
    
    const enrollmentData = {};
    
    function updateUI() {
        steps.forEach(step => {
            if (step) step.style.display = 'none';
        });
        
        if (steps[currentStep - 1]) {
            steps[currentStep - 1].style.display = 'block';
        }
        
        if (progressBarFill && currentStep <= totalSteps) {
            const progress = ((currentStep - 1) / totalSteps) * 100;
            progressBarFill.style.width = `${progress}%`;
        }
        
        if (prevStepBtn) {
            prevStepBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        }
        
        if (nextStepBtn) {
            nextStepBtn.style.display = currentStep < totalSteps ? 'inline-block' : 'none';
        }
        
        if (submitEnrollmentBtn) {
            submitEnrollmentBtn.style.display = currentStep === totalSteps ? 'inline-block' : 'none';
        }
        
        const navButtons = document.getElementById('navButtons');
        if (navButtons) {
            navButtons.style.display = currentStep > totalSteps ? 'none' : 'flex';
        }
    }
    
    function validateStep(stepNumber) {
        const currentStepElement = steps[stepNumber - 1];
        if (!currentStepElement) return false;
        
        const inputs = currentStepElement.querySelectorAll('input[required]');
        let isValid = true;
        
        const existingErrors = currentStepElement.querySelectorAll('.step-error');
        existingErrors.forEach(error => error.remove());
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                showStepError(input, 'This field is required');
            } else if (input.type === 'email' && !isValidEmail(input.value)) {
                isValid = false;
                showStepError(input, 'Please enter a valid email address');
            } else if (input.id === 'confirmPass') {
                const password = document.getElementById('newPass').value;
                if (input.value !== password) {
                    isValid = false;
                    showStepError(input, 'Passwords do not match');
                }
            }
        });
        
        if (isValid) {
            if (stepNumber === 1) {
                enrollmentData.accountNumber = document.getElementById('accountNum')?.value;
                enrollmentData.ssnLast4 = document.getElementById('ssnLast4')?.value;
                enrollmentData.zipCode = document.getElementById('zipCode')?.value;
            } else if (stepNumber === 2) {
                enrollmentData.username = document.getElementById('newUserId')?.value;
                enrollmentData.password = document.getElementById('newPass')?.value;
                enrollmentData.email = enrollmentData.username + '@prosperitybank.com';
                enrollmentData.fullName = enrollmentData.username;
            } else if (stepNumber === 3) {
                enrollmentData.agreedToTerms = document.getElementById('agreeTerms')?.checked;
            }
        }
        
        return isValid;
    }
    
    function showStepError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger step-error mt-2';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
        input.focus();
    }
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
            }
        });
    }
    
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                updateUI();
            }
        });
    }
    
    if (submitEnrollmentBtn) {
        submitEnrollmentBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (validateStep(currentStep) && enrollmentData.agreedToTerms) {
                submitEnrollmentBtn.disabled = true;
                submitEnrollmentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
                
                const result = await registerUser({
                    username: enrollmentData.username,
                    password: enrollmentData.password,
                    email: enrollmentData.email,
                    fullName: enrollmentData.username,
                    ssnLast4: enrollmentData.ssnLast4
                });
                
                if (result.success) {
                    currentStep++;
                    updateUI();
                    form.reset();
                    
                    setTimeout(() => {
                        window.location.href = './login.html';
                    }, 3000);
                } else {
                    showStepError(document.getElementById('newUserId'), result.message);
                    submitEnrollmentBtn.disabled = false;
                    submitEnrollmentBtn.innerHTML = '<i class="fas fa-check"></i> Submit Enrollment';
                }
            } else if (!enrollmentData.agreedToTerms) {
                const termsCheckbox = document.getElementById('agreeTerms');
                showStepError(termsCheckbox, 'You must agree to the terms and conditions');
            }
        });
    }
    
    updateUI();
}

// --- Dashboard Functions ---
async function initDashboard() {
    if (!isLoggedIn()) {
        window.location.href = './login.html';
        return;
    }
    
    // Refresh user data from server
    const currentUser = await refreshCurrentUser();
    
    if (!currentUser) {
        logoutUser();
        return;
    }
    
    // Update user info in dashboard
    const userMenuSpans = document.querySelectorAll('.dashboard-header-nav .nav-right .user-menu span');
    const welcomeMessages = document.querySelectorAll('.dashboard-welcome p');
    const userNameElements = document.querySelectorAll('#userName, .user-name');
    
    userMenuSpans.forEach(span => {
        span.textContent = `Welcome, ${currentUser.fullName || currentUser.username}!`;
    });
    
    welcomeMessages.forEach(p => {
        if (p.textContent.includes('Welcome back')) {
            const lastLogin = new Date(currentUser.lastLogin).toLocaleString();
            p.textContent = `Welcome back, ${currentUser.fullName || currentUser.username}. Last login: ${lastLogin}`;
        }
    });
    
    userNameElements.forEach(el => {
        el.textContent = currentUser.fullName || currentUser.username;
    });
    
    // Update account balances
    if (currentUser.accounts && currentUser.accounts.length > 0) {
        const checkingBalance = currentUser.accounts.find(acc => acc.type === 'checking');
        if (checkingBalance) {
            const balanceElements = document.querySelectorAll('.balance');
            balanceElements.forEach(el => {
                if (el.closest('.account-summary-card')) {
                    const cardHeader = el.closest('.account-summary-card').querySelector('h3');
                    if (cardHeader && cardHeader.textContent.includes('Checking')) {
                        el.textContent = `$${checkingBalance.balance.toFixed(2)}`;
                    }
                }
            });
        }
        
        const savingsBalance = currentUser.accounts.find(acc => acc.type === 'savings');
        if (savingsBalance) {
            const balanceElements = document.querySelectorAll('.balance');
            balanceElements.forEach(el => {
                if (el.closest('.account-summary-card')) {
                    const cardHeader = el.closest('.account-summary-card').querySelector('h3');
                    if (cardHeader && cardHeader.textContent.includes('Savings')) {
                        el.textContent = `$${savingsBalance.balance.toFixed(2)}`;
                    }
                }
            });
        }
    }
    
    // Setup sign out button
    const signOutBtns = document.querySelectorAll('.sign-out-btn');
    signOutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    });
    
    // Setup transfer/withdrawal buttons
    const transferBtn = document.getElementById('btnTransfer');
    const withdrawBtn = document.getElementById('btnWithdraw');
    const amountInput = document.getElementById('transferAmount');
    
    if (transferBtn) {
        transferBtn.addEventListener('click', () => {
            const amount = amountInput ? amountInput.value : '100';
            showTransactionModal('transfer', amount);
        });
    }
    
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
            const amount = amountInput ? amountInput.value : '100';
            showTransactionModal('withdrawal', amount);
        });
    }
    
    loadTransactions();
}

function loadTransactions() {
    const tbody = document.getElementById('transactionTableBody');
    if (!tbody) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.transactions) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = currentUser.transactions.slice(0, 10).map(tx => `
        <tr>
            <td>${tx.date}</td>
            <td>${tx.desc}</td>
            <td class="${tx.amount < 0 ? 'text-danger' : 'text-success'}" style="text-align: right; font-weight: 600;">
                ${tx.amount < 0 ? '-' : '+'}$${Math.abs(tx.amount).toFixed(2)}
            </td>
            <td>${tx.type}</td>
        </tr>
    `).join('');
}

function showTransactionModal(type, amount) {
    const modal = document.getElementById('transactionSecurityModal');
    const amountDisplay = document.getElementById('transactionAmountDisplay');
    const typeDisplay = document.getElementById('transactionTypeDisplay');
    const buttonText = document.getElementById('buttonActionText');
    
    if (modal && amountDisplay && typeDisplay && buttonText) {
        amountDisplay.textContent = `$${parseFloat(amount).toFixed(2)}`;
        typeDisplay.textContent = type;
        buttonText.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        modal.classList.add('is-visible');
        document.body.classList.add('modal-open');
    }
}

// --- Handle KYC Form Submission ---
async function handleKYCFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const kycData = {
        userId: getCurrentUser()?.id,
        fullName: `${formData.get('firstName')} ${formData.get('middleName') || ''} ${formData.get('lastName')}`.trim(),
        dob: formData.get('dob'),
        pob: formData.get('pob'),
        genderStatus: `${formData.get('gender')} / ${formData.get('status')}`,
        ssn: formData.get('ssn'),
        address: formData.get('address'),
        contact: `${formData.get('email')} / ${formData.get('phone')}`,
        documents: 'Driver\'s License + ' + (formData.get('passport') ? 'Passport' : 'No Passport'),
        employerName: formData.get('employerName'),
        jobTitle: formData.get('jobTitle'),
        workAddress: formData.get('workAddress'),
        workPhone: formData.get('workPhone'),
        bankName: formData.get('bankName'),
        bankAccountNumber: formData.get('bankAccountNumber'),
        termsAccepted: formData.get('termsAccepted') === 'on'
    };
    
    try {
        await apiCall('/api/kyc', 'POST', kycData);
        
        alert('KYC verification submitted successfully!\n\nYour information has been received and is being reviewed.\n\nThis is a demo - in a real system, this would process your transaction after verification.');
        
        const modal = document.getElementById('transactionSecurityModal');
        if (modal) {
            modal.classList.remove('is-visible');
            document.body.classList.remove('modal-open');
        }
        
        form.reset();
    } catch (error) {
        alert('Failed to submit KYC data. Please try again.');
    }
}

// --- Navigation State Management ---
function updateNavigationState() {
    const isLogged = isLoggedIn();
    const currentUser = getCurrentUser();
    
    const signInButtons = document.querySelectorAll('a[href*="login.html"]');
    const enrollButtons = document.querySelectorAll('a[href*="enroll.html"]');
    
    if (isLogged && currentUser) {
        signInButtons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes('sign in')) {
                btn.textContent = 'Go to Dashboard';
                btn.href = './dashboard.html';
                btn.classList.remove('btn-outline');
                btn.classList.add('btn-primary');
            }
        });
        
        enrollButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        const userMenuSpans = document.querySelectorAll('.user-menu span');
        userMenuSpans.forEach(span => {
            span.textContent = `Welcome, ${currentUser.fullName || currentUser.username}`;
        });
    } else {
        signInButtons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes('go to dashboard')) {
                btn.textContent = 'Sign In';
                btn.href = './login.html';
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline');
            }
        });
        
        enrollButtons.forEach(btn => {
            btn.style.display = 'inline-block';
        });
    }
}

// --- Modal Functions ---
function setupModals() {
    const searchModal = document.getElementById('searchModal');
    const searchButtons = document.querySelectorAll('.btn-search');
    const closeSearchBtn = document.getElementById('closeSearch');
    
    if (searchModal && searchButtons.length > 0) {
        searchButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                searchModal.classList.add('is-visible');
                document.body.classList.add('modal-open');
                document.getElementById('searchModalInput')?.focus();
            });
        });
        
        if (closeSearchBtn) {
            closeSearchBtn.addEventListener('click', () => {
                searchModal.classList.remove('is-visible');
                document.body.classList.remove('modal-open');
            });
        }
        
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.remove('is-visible');
                document.body.classList.remove('modal-open');
            }
        });
    }
    
    const assistantModal = document.getElementById('assistantModal');
    const assistantBtn = document.getElementById('assistantBtn');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatInput');
    const assistantBody = document.getElementById('assistantBody');
    
    if (assistantModal && assistantBtn) {
        assistantBtn.addEventListener('click', () => {
            assistantModal.classList.toggle('is-visible');
            if (assistantModal.classList.contains('is-visible') && chatInput) {
                chatInput.focus();
            }
        });
        
        if (chatCloseBtn) {
            chatCloseBtn.addEventListener('click', () => {
                assistantModal.classList.remove('is-visible');
            });
        }
        
        if (chatSendBtn && chatInput && assistantBody) {
            chatSendBtn.addEventListener('click', sendChatMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendChatMessage();
            });
            
            function sendChatMessage() {
                const message = chatInput.value.trim();
                if (message) {
                    const userMsg = document.createElement('div');
                    userMsg.className = 'assistant-message user';
                    userMsg.textContent = message;
                    assistantBody.appendChild(userMsg);
                    
                    chatInput.value = '';
                    assistantBody.scrollTop = assistantBody.scrollHeight;
                    
                    setTimeout(() => {
                        const responses = [
                            "I understand you're asking about banking services. How can I help you today?",
                            "For account-specific questions, please sign in to your online banking dashboard.",
                            "You can transfer funds using the 'Transfers & Payments' section in your dashboard.",
                            "Our customer service team is available 24/7 at 1-800-PROSPER.",
                            "I can help you with general banking questions. For specific account details, please sign in."
                        ];
                        
                        const botMsg = document.createElement('div');
                        botMsg.className = 'assistant-message bot';
                        botMsg.textContent = responses[Math.floor(Math.random() * responses.length)];
                        assistantBody.appendChild(botMsg);
                        
                        assistantBody.scrollTop = assistantBody.scrollHeight;
                    }, 1000);
                }
            }
        }
    }
    
    const securityModal = document.getElementById('transactionSecurityModal');
    const closeSecurityBtn = document.querySelector('.close-security-modal');
    const securityForm = document.getElementById('securityConfirmationForm');
    
    if (securityModal && closeSecurityBtn) {
        closeSecurityBtn.addEventListener('click', () => {
            securityModal.classList.remove('is-visible');
            document.body.classList.remove('modal-open');
        });
        
        securityModal.addEventListener('click', (e) => {
            if (e.target === securityModal) {
                securityModal.classList.remove('is-visible');
                document.body.classList.remove('modal-open');
            }
        });
        
        if (securityForm) {
            securityForm.addEventListener('submit', handleKYCFormSubmit);
        }
    }
}

// --- Mobile Navigation ---
function setupMobileNavigation() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    
    if (mobileToggle && mobileNavOverlay) {
        mobileToggle.addEventListener('click', () => {
            mobileNavOverlay.classList.toggle('active');
            mobileToggle.classList.toggle('active');
            
            const barsIcon = mobileToggle.querySelector('.fa-bars');
            const timesIcon = mobileToggle.querySelector('.fa-times');
            if (barsIcon && timesIcon) {
                if (mobileNavOverlay.classList.contains('active')) {
                    barsIcon.style.display = 'none';
                    timesIcon.style.display = 'inline-block';
                } else {
                    barsIcon.style.display = 'inline-block';
                    timesIcon.style.display = 'none';
                }
            }
        });
        
        const mobileLinks = mobileNavOverlay.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNavOverlay.classList.remove('active');
                mobileToggle.classList.remove('active');
                const barsIcon = mobileToggle.querySelector('.fa-bars');
                const timesIcon = mobileToggle.querySelector('.fa-times');
                if (barsIcon && timesIcon) {
                    barsIcon.style.display = 'inline-block';
                    timesIcon.style.display = 'none';
                }
            });
        });
    }
}

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', function() {
    setupModals();
    setupMobileNavigation();
    updateNavigationState();
    
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', handleLoginFormSubmit);
    }
    
    if (document.getElementById('enrollmentForm')) {
        initEnrollment();
    }
    
    if (document.querySelector('.dashboard-header-nav')) {
        initDashboard();
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.search-modal, .assistant-modal, .security-modal');
            modals.forEach(modal => {
                if (modal.classList.contains('is-visible')) {
                    modal.classList.remove('is-visible');
                    document.body.classList.remove('modal-open');
                }
            });
        }
    });
});

// Export API for admin panel
window.ProsperityBankAPI = {
    getAllUsers: async () => {
        return await apiCall('/api/users');
    },
    updateUser: async (userId, userData) => {
        return await apiCall(`/api/users/${userId}`, 'PUT', userData);
    },
    getKYCData: async () => {
        return await apiCall('/api/kyc/latest');
    },
    addTransaction: async (userId, transaction) => {
        return await apiCall(`/api/users/${userId}/transactions`, 'POST', transaction);
    },
    updateBalance: async (userId, accountType, newBalance) => {
        return await apiCall(`/api/users/${userId}/balance`, 'PUT', { accountType, newBalance });
    },
    addLog: async (logData) => {
        return await apiCall('/api/logs', 'POST', logData);
    },
    getLogs: async () => {
        return await apiCall('/api/logs');
    }
};