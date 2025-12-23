// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.accounts = [];
        this.transactions = [];
        this.initialize();
    }

    initialize() {
        this.loadUserData();
        this.setupCharts();
        this.setupQuickActions();
        this.setupAccountManagement();
        this.setupTransferForm();
        this.setupCardManagement();
        this.setupAlerts();
    }

    loadUserData() {
        // Load from localStorage or use demo data
        const userData = localStorage.getItem('bankUser');
        if (userData) {
            const user = JSON.parse(userData);
            this.updateUserInfo(user);
        }

        // Load accounts
        this.accounts = [
            {
                id: 'checking-4567',
                type: 'checking',
                name: 'Advantage Plus Checking',
                number: '••••4567',
                balance: 12345.67,
                available: 12345.67,
                interest: 0.01
            },
            {
                id: 'savings-8910',
                type: 'savings',
                name: 'High-Yield Savings',
                number: '••••8910',
                balance: 25432.10,
                available: 25432.10,
                interest: 2.5
            },
            {
                id: 'credit-1234',
                type: 'credit',
                name: 'Premium Rewards Credit Card',
                number: '••••1234',
                balance: -1234.56,
                available: 8765.44,
                creditLimit: 10000
            }
        ];

        // Load transactions
        this.transactions = [
            {
                id: 1,
                date: '2024-01-15',
                description: 'Amazon.com',
                amount: -127.53,
                category: 'shopping',
                status: 'completed',
                account: 'checking-4567'
            },
            {
                id: 2,
                date: '2024-01-14',
                description: 'Direct Deposit - ABC Corp',
                amount: 3250.00,
                category: 'income',
                status: 'completed',
                account: 'checking-4567'
            },
            {
                id: 3,
                date: '2024-01-12',
                description: 'Starbucks',
                amount: -5.75,
                category: 'food',
                status: 'completed',
                account: 'checking-4567'
            },
            {
                id: 4,
                date: '2024-01-11',
                description: 'ATM Withdrawal',
                amount: -100.00,
                category: 'cash',
                status: 'completed',
                account: 'checking-4567'
            },
            {
                id: 5,
                date: '2024-01-10',
                description: 'Netflix',
                amount: -15.99,
                category: 'entertainment',
                status: 'completed',
                account: 'checking-4567'
            }
        ];

        this.renderAccounts();
        this.renderRecentTransactions();
        this.updateAccountSummary();
    }

    updateUserInfo(user) {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        
        if (userName) {
            userName.textContent = user.name;
        }
        
        if (userAvatar) {
            const initials = user.name.split(' ').map(n => n[0]).join('');
            userAvatar.textContent = initials;
        }
    }

    setupCharts() {
        // Spending chart
        const spendingCtx = document.getElementById('spendingChart');
        if (spendingCtx) {
            new Chart(spendingCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Housing', 'Transportation', 'Food', 'Entertainment', 'Shopping', 'Other'],
                    datasets: [{
                        data: [1200, 600, 400, 300, 250, 150],
                        backgroundColor: [
                            '#012169',
                            '#E41F34',
                            '#1A7F5C',
                            '#FFC107',
                            '#4A4A4A',
                            '#F0F5FF'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }

        // Balance trend chart
        const trendCtx = document.getElementById('balanceTrend');
        if (trendCtx) {
            new Chart(trendCtx, {
                type: 'line',
                data: {
                    labels: ['Jan 1', 'Jan 5', 'Jan 10', 'Jan 15', 'Jan 20', 'Jan 25', 'Jan 30'],
                    datasets: [{
                        label: 'Account Balance',
                        data: [12000, 12500, 11800, 13500, 14200, 13800, 14500],
                        borderColor: '#012169',
                        backgroundColor: 'rgba(1, 33, 105, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        },
                        x: {
                            grid: {
                                color: 'rgba(0,0,0,0.05)'
                            }
                        }
                    }
                }
            });
        }
    }

    setupQuickActions() {
        // Transfer button
        const transferBtn = document.getElementById('quickTransferBtn');
        if (transferBtn) {
            transferBtn.addEventListener('click', () => {
                this.showTransferModal();
            });
        }

        // Bill pay button
        const billPayBtn = document.getElementById('quickBillPayBtn');
        if (billPayBtn) {
            billPayBtn.addEventListener('click', () => {
                this.showBillPayModal();
            });
        }

        // Deposit button
        const depositBtn = document.getElementById('quickDepositBtn');
        if (depositBtn) {
            depositBtn.addEventListener('click', () => {
                this.showMobileDepositModal();
            });
        }

        // Statements button
        const statementsBtn = document.getElementById('quickStatementsBtn');
        if (statementsBtn) {
            statementsBtn.addEventListener('click', () => {
                window.location.href = 'statements.html';
            });
        }
    }

    setupAccountManagement() {
        // Account details links
        const accountLinks = document.querySelectorAll('[data-account-details]');
        accountLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const accountId = link.getAttribute('data-account-details');
                this.showAccountDetails(accountId);
            });
        });

        // Add account button
        const addAccountBtn = document.getElementById('addAccountBtn');
        if (addAccountBtn) {
            addAccountBtn.addEventListener('click', () => {
                this.showAddAccountModal();
            });
        }
    }

    setupTransferForm() {
        const transferForm = document.getElementById('transferForm');
        if (transferForm) {
            transferForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processTransfer();
            });
        }

        // Real-time amount validation
        const amountInput = document.getElementById('transferAmount');
        if (amountInput) {
            amountInput.addEventListener('input', (e) => {
                this.validateTransferAmount(e.target.value);
            });
        }

        // Account selection
        const fromAccountSelect = document.getElementById('fromAccount');
        if (fromAccountSelect) {
            this.populateAccountSelect(fromAccountSelect);
        }

        const toAccountSelect = document.getElementById('toAccount');
        if (toAccountSelect) {
            this.populateAccountSelect(toAccountSelect, true);
        }
    }

    setupCardManagement() {
        // Card lock/unlock
        const cardLockBtns = document.querySelectorAll('.card-lock-btn');
        cardLockBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cardId = e.target.closest('.bank-card').dataset.cardId;
                this.toggleCardLock(cardId);
            });
        });

        // Report lost/stolen
        const reportBtns = document.querySelectorAll('.card-report-btn');
        reportBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cardId = e.target.closest('.bank-card').dataset.cardId;
                this.reportCard(cardId);
            });
        });
    }

    setupAlerts() {
        // Toggle switches
        const toggleSwitches = document.querySelectorAll('.toggle-switch input');
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const alertType = e.target.closest('.alert-item').dataset.alertType;
                this.updateAlertSetting(alertType, e.target.checked);
            });
        });

        // Alert test buttons
        const testAlertBtns = document.querySelectorAll('.test-alert-btn');
        testAlertBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertType = e.target.closest('.alert-item').dataset.alertType;
                this.testAlert(alertType);
            });
        });
    }

    renderAccounts() {
        const accountsContainer = document.getElementById('accountsContainer');
        if (!accountsContainer) return;

        accountsContainer.innerHTML = this.accounts.map(account => `
            <div class="account-card" data-account-id="${account.id}">
                <div class="account-type">${this.getAccountTypeName(account.type)}</div>
                <h3 class="account-name">${account.name}</h3>
                <div class="account-number">${account.number}</div>
                <div class="account-balance">${this.formatCurrency(account.balance)}</div>
                ${account.available !== undefined ? 
                    `<div class="account-available">Available: ${this.formatCurrency(account.available)}</div>` : ''}
                ${account.interest !== undefined ? 
                    `<div class="account-interest">Interest rate: ${account.interest}%</div>` : ''}
                <div class="account-actions">
                    <button class="btn btn-outline btn-sm" onclick="dashboard.showAccountDetails('${account.id}')">
                        Details
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="dashboard.showTransferModal('${account.id}')">
                        Transfer
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        if (!container) return;

        const recentTransactions = this.transactions.slice(0, 10);
        
        container.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${this.formatDate(transaction.date)}</div>
                </div>
                <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                    ${transaction.amount > 0 ? '+' : ''}${this.formatCurrency(transaction.amount)}
                </div>
            </div>
        `).join('');
    }

    updateAccountSummary() {
        const totalBalance = this.accounts.reduce((sum, account) => sum + account.balance, 0);
        const totalAssets = this.accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
        const totalDebt = Math.abs(this.accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0));

        const totalBalanceEl = document.getElementById('totalBalance');
        const totalAssetsEl = document.getElementById('totalAssets');
        const totalDebtEl = document.getElementById('totalDebt');

        if (totalBalanceEl) totalBalanceEl.textContent = this.formatCurrency(totalBalance);
        if (totalAssetsEl) totalAssetsEl.textContent = this.formatCurrency(totalAssets);
        if (totalDebtEl) totalDebtEl.textContent = this.formatCurrency(totalDebt);
    }

    // Modal methods
    showTransferModal(prefilledAccount = null) {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;

        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Transfer Money</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <form id="quickTransferForm">
                    <div class="form-group">
                        <label class="form-label">From Account</label>
                        <select class="form-control" id="modalFromAccount" required>
                            <option value="">Select account</option>
                            ${this.accounts.filter(a => a.balance > 0).map(account => `
                                <option value="${account.id}" ${prefilledAccount === account.id ? 'selected' : ''}>
                                    ${account.name} (${this.formatCurrency(account.balance)})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">To Account</label>
                        <select class="form-control" id="modalToAccount" required>
                            <option value="">Select account</option>
                            ${this.accounts.map(account => `
                                <option value="${account.id}">
                                    ${account.name}
                                </option>
                            `).join('')}
                            <option value="external">External Account</option>
                            <option value="zelle">Zelle® Recipient</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Amount</label>
                        <input type="number" class="form-control" id="modalAmount" 
                               step="0.01" min="0.01" required placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description (Optional)</label>
                        <input type="text" class="form-control" placeholder="e.g., Rent payment">
                    </div>
                    <div class="form-group">
                        <label class="form-label">When</label>
                        <select class="form-control">
                            <option value="now">Now</option>
                            <option value="date">Schedule for later</option>
                            <option value="recurring">Set up recurring</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Continue</button>
                </form>
            </div>
        `;

        document.getElementById('modalOverlay').style.display = 'flex';
        
        // Setup form submission
        document.getElementById('quickTransferForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processQuickTransfer();
        });
    }

    showBillPayModal() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;

        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Pay Bills</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="payee-list">
                    <h4>Recent Payees</h4>
                    <div class="payee-item">
                        <div class="payee-info">
                            <div class="payee-name">Electric Company</div>
                            <div class="payee-account">Account: ••••1234</div>
                        </div>
                        <button class="btn btn-outline btn-sm">Pay</button>
                    </div>
                    <div class="payee-item">
                        <div class="payee-info">
                            <div class="payee-name">Water Department</div>
                            <div class="payee-account">Account: ••••5678</div>
                        </div>
                        <button class="btn btn-outline btn-sm">Pay</button>
                    </div>
                    <div class="payee-item">
                        <div class="payee-info">
                            <div class="payee-name">Internet Provider</div>
                            <div class="payee-account">Account: ••••9012</div>
                        </div>
                        <button class="btn btn-outline btn-sm">Pay</button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="dashboard.addNewPayee()">
                        <i class="fas fa-plus"></i> Add New Payee
                    </button>
                </div>
            </div>
        `;

        document.getElementById('modalOverlay').style.display = 'flex';
    }

    showMobileDepositModal() {
        const modalContent = document.getElementById('modalContent');
        if (!modalContent) return;

        modalContent.innerHTML = `
            <div class="modal-header">
                <h3>Mobile Check Deposit</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="deposit-instructions">
                    <ol>
                        <li>Endorse the back of your check with your signature</li>
                        <li>Write "For mobile deposit only" below your signature</li>
                        <li>Take clear photos of both sides of the check</li>
                        <li>Enter the check amount below</li>
                    </ol>
                </div>
                <form id="depositForm">
                    <div class="form-group">
                        <label class="form-label">Deposit to Account</label>
                        <select class="form-control" required>
                            ${this.accounts.filter(a => a.type === 'checking').map(account => `
                                <option value="${account.id}">${account.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Check Amount</label>
                        <input type="number" class="form-control" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Front of Check</label>
                        <div class="file-upload">
                            <input type="file" accept="image/*" capture="camera" required>
                            <div class="upload-preview"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Back of Check</label>
                        <div class="file-upload">
                            <input type="file" accept="image/*" capture="camera" required>
                            <div class="upload-preview"></div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">Submit Deposit</button>
                </form>
            </div>
        `;

        document.getElementById('modalOverlay').style.display = 'flex';
    }

    // Utility methods
    getAccountTypeName(type) {
        const types = {
            'checking': 'Checking Account',
            'savings': 'Savings Account',
            'credit': 'Credit Card',
            'loan': 'Loan',
            'investment': 'Investment'
        };
        return types[type] || type;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    populateAccountSelect(selectElement, includeExternal = false) {
        if (!selectElement) return;
        
        selectElement.innerHTML = `
            <option value="">Select account</option>
            ${this.accounts.map(account => `
                <option value="${account.id}">
                    ${account.name} (${this.formatCurrency(account.balance)})
                </option>
            `).join('')}
            ${includeExternal ? `
                <option value="external">External Account</option>
                <option value="zelle">Zelle®</option>
            ` : ''}
        `;
    }

    validateTransferAmount(amount) {
        const amountNum = parseFloat(amount);
        const fromAccount = document.getElementById('fromAccount')?.value;
        
        if (!fromAccount || !amountNum) return true;
        
        const account = this.accounts.find(a => a.id === fromAccount);
        if (!account) return true;
        
        if (amountNum > account.available) {
            this.showError('Amount exceeds available balance');
            return false;
        }
        
        if (amountNum <= 0) {
            this.showError('Amount must be greater than 0');
            return false;
        }
        
        return true;
    }

    processTransfer() {
        const fromAccount = document.getElementById('fromAccount')?.value;
        const toAccount = document.getElementById('toAccount')?.value;
        const amount = parseFloat(document.getElementById('transferAmount')?.value);
        const description = document.getElementById('transferDescription')?.value || '';
        
        if (!this.validateTransfer(amount)) return;
        
        // Simulate transfer processing
        const transfer = {
            id: Date.now(),
            from: fromAccount,
            to: toAccount,
            amount: amount,
            description: description,
            date: new Date().toISOString(),
            status: 'processing'
        };
        
        // Show processing
        this.showNotification('Processing transfer...', 'info');
        
        // Simulate API call delay
        setTimeout(() => {
            transfer.status = 'completed';
            this.transactions.unshift({
                ...transfer,
                account: fromAccount,
                amount: -amount
            });
            
            // Update accounts
            const fromAcc = this.accounts.find(a => a.id === fromAccount);
            const toAcc = this.accounts.find(a => a.id === toAccount);
            
            if (fromAcc) fromAcc.balance -= amount;
            if (toAcc) toAcc.balance += amount;
            
            this.renderAccounts();
            this.renderRecentTransactions();
            this.updateAccountSummary();
            
            this.showNotification('Transfer completed successfully!', 'success');
        }, 1500);
    }

    validateTransfer(amount) {
        // Add validation logic here
        return true;
    }

    showError(message) {
        // Implement error display
        console.error(message);
    }

    showNotification(message, type = 'info') {
        if (typeof bankWebsite !== 'undefined') {
            bankWebsite.showNotification(message, type);
        }
    }

    toggleCardLock(cardId) {
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        if (!card) return;
        
        const isLocked = card.classList.contains('locked');
        const newStatus = !isLocked;
        
        card.classList.toggle('locked');
        const statusElement = card.querySelector('.card-status');
        if (statusElement) {
            statusElement.textContent = newStatus ? 'Locked' : 'Active';
            statusElement.style.background = newStatus ? 
                'rgba(228, 31, 52, 0.2)' : 'rgba(26, 127, 92, 0.2)';
        }
        
        this.showNotification(
            `Card ${newStatus ? 'locked' : 'unlocked'} successfully`,
            'success'
        );
    }

    reportCard(cardId) {
        if (!confirm('Are you sure you want to report this card as lost or stolen? This will permanently deactivate the card.')) {
            return;
        }
        
        // Simulate reporting
        const card = document.querySelector(`[data-card-id="${cardId}"]`);
        if (card) {
            card.classList.add('reported');
            card.querySelector('.card-status').textContent = 'Reported';
            card.querySelector('.card-status').style.background = 'rgba(255, 193, 7, 0.2)';
        }
        
        this.showNotification('Card reported. New card will be issued within 5-7 business days.', 'success');
    }

    updateAlertSetting(alertType, enabled) {
        // Save to localStorage
        const alertSettings = JSON.parse(localStorage.getItem('alertSettings') || '{}');
        alertSettings[alertType] = enabled;
        localStorage.setItem('alertSettings', JSON.stringify(alertSettings));
        
        this.showNotification(
            `${enabled ? 'Enabled' : 'Disabled'} ${alertType} alerts`,
            'success'
        );
    }

    testAlert(alertType) {
        const testMessages = {
            'low-balance': 'Test alert: Your account balance is below $100',
            'large-transaction': 'Test alert: A transaction of $500+ was made',
            'deposit': 'Test alert: A deposit has been made to your account',
            'bill-due': 'Test alert: Bill payment due in 3 days'
        };
        
        this.showNotification(testMessages[alertType] || 'Test alert sent', 'info');
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});