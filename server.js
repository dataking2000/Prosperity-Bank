/**
 * Prosperity Bank - Server.js Backend
 * Mini database using JSON file storage for Render deployment
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// Database file paths
const DB_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const KYC_FILE = path.join(DB_DIR, 'kyc.json');
const LOGS_FILE = path.join(DB_DIR, 'logs.json');

// Initialize database directory and files
async function initDatabase() {
    try {
        await fs.mkdir(DB_DIR, { recursive: true });
        
        // Initialize users file with demo user
        try {
            await fs.access(USERS_FILE);
        } catch {
            const demoUser = {
                id: 1,
                username: 'demo',
                password: 'demo123',
                email: 'demo@prosperitybank.com',
                fullName: 'Demo User',
                address: '123 Demo Street, Demo City, DC 12345',
                phone: '(555) 123-4567',
                dob: '1990-01-15',
                ssnLast4: '1234',
                employment: 'Demo Company Inc.',
                jobTitle: 'Software Engineer',
                accounts: [
                    {
                        type: 'checking',
                        name: 'Advantage Plus Checking',
                        number: '****9876',
                        balance: 1452.88
                    },
                    {
                        type: 'savings',
                        name: 'High-Yield Savings',
                        number: '****5432',
                        balance: 12350.15
                    }
                ],
                transactions: [
                    { id: 'tx1', date: '2023-12-05', type: 'Transfer', amount: -100.00, desc: 'Quick Transfer to Savings', status: 'status-success' },
                    { id: 'tx2', date: '2023-12-04', type: 'Deposit', amount: 2500.00, desc: 'Payroll Deposit - ACME Inc.', status: 'status-success' },
                    { id: 'tx3', date: '2023-12-04', type: 'Payment', amount: -50.00, desc: 'Netflix Subscription', status: 'status-success' },
                    { id: 'tx4', date: '2023-12-03', type: 'Purchase', amount: -12.45, desc: 'Starbucks Coffee', status: 'status-success' },
                    { id: 'tx5', date: '2023-12-03', type: 'ATM', amount: -20.00, desc: 'ATM Withdrawal - Local Bank', status: 'status-success' }
                ],
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            await fs.writeFile(USERS_FILE, JSON.stringify([demoUser], null, 2));
        }
        
        // Initialize KYC file
        try {
            await fs.access(KYC_FILE);
        } catch {
            await fs.writeFile(KYC_FILE, JSON.stringify([], null, 2));
        }
        
        // Initialize logs file
        try {
            await fs.access(LOGS_FILE);
        } catch {
            await fs.writeFile(LOGS_FILE, JSON.stringify([], null, 2));
        }
        
        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

// Helper functions
async function readJSON(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filepath}:`, error);
        return [];
    }
}

async function writeJSON(filepath, data) {
    try {
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filepath}:`, error);
        return false;
    }
}

// ==================== API ROUTES ====================

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        // Remove passwords from response
        const sanitizedUsers = users.map(u => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
        });
        res.json(sanitizedUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get single user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const user = users.find(u => u.id === parseInt(req.params.id));
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Register new user
app.post('/api/register', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const { username, password, email, fullName, ssnLast4 } = req.body;
        
        // Check if username or email exists
        if (users.some(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        if (users.some(u => u.email === email)) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            username,
            password, // In production, hash this!
            email: email || `${username}@prosperitybank.com`,
            fullName: fullName || username,
            address: 'Address not provided',
            phone: '(555) 000-0000',
            dob: '1990-01-01',
            ssnLast4: ssnLast4 || '0000',
            employment: 'Self-employed',
            jobTitle: 'Professional',
            accounts: [
                {
                    type: 'checking',
                    name: 'New Customer Checking',
                    number: '****' + Math.floor(1000 + Math.random() * 9000),
                    balance: 500.00
                }
            ],
            transactions: [
                {
                    id: 'welcome_' + Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    type: 'Deposit',
                    amount: 500.00,
                    desc: 'Welcome Bonus - New Account',
                    status: 'status-success'
                }
            ],
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await writeJSON(USERS_FILE, users);
        
        const { password: _, ...userWithoutPassword } = newUser;
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const { username, password } = req.body;
        
        const user = users.find(u => 
            (u.username === username || u.email === username) && 
            u.password === password
        );
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        const userIndex = users.findIndex(u => u.id === user.id);
        users[userIndex] = user;
        await writeJSON(USERS_FILE, users);
        
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Merge updates
        users[userIndex] = { ...users[userIndex], ...req.body };
        await writeJSON(USERS_FILE, users);
        
        const { password, ...userWithoutPassword } = users[userIndex];
        res.json({ success: true, user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Update user balance
app.put('/api/users/:id/balance', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const { accountType, newBalance } = req.body;
        const accountIndex = users[userIndex].accounts.findIndex(acc => acc.type === accountType);
        
        if (accountIndex === -1) {
            return res.status(404).json({ error: 'Account not found' });
        }
        
        users[userIndex].accounts[accountIndex].balance = newBalance;
        await writeJSON(USERS_FILE, users);
        
        res.json({ success: true, balance: newBalance });
    } catch (error) {
        res.status(500).json({ error: 'Balance update failed' });
    }
});

// Add transaction
app.post('/api/users/:id/transactions', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (!users[userIndex].transactions) {
            users[userIndex].transactions = [];
        }
        
        users[userIndex].transactions.unshift(req.body);
        await writeJSON(USERS_FILE, users);
        
        res.json({ success: true, transaction: req.body });
    } catch (error) {
        res.status(500).json({ error: 'Transaction add failed' });
    }
});

// KYC endpoints
app.get('/api/kyc', async (req, res) => {
    try {
        const kycData = await readJSON(KYC_FILE);
        res.json(kycData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch KYC data' });
    }
});

app.post('/api/kyc', async (req, res) => {
    try {
        const kycData = await readJSON(KYC_FILE);
        const newKYC = {
            ...req.body,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };
        
        kycData.push(newKYC);
        await writeJSON(KYC_FILE, kycData);
        
        res.json({ success: true, kyc: newKYC });
    } catch (error) {
        res.status(500).json({ error: 'KYC submission failed' });
    }
});

app.get('/api/kyc/latest', async (req, res) => {
    try {
        const kycData = await readJSON(KYC_FILE);
        const latest = kycData[kycData.length - 1] || null;
        res.json(latest);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch latest KYC' });
    }
});

// Admin logs
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await readJSON(LOGS_FILE);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

app.post('/api/logs', async (req, res) => {
    try {
        const logs = await readJSON(LOGS_FILE);
        const newLog = {
            ...req.body,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };
        
        logs.unshift(newLog);
        
        // Keep only last 50 logs
        if (logs.length > 50) {
            logs.splice(50);
        }
        
        await writeJSON(LOGS_FILE, logs);
        res.json({ success: true, log: newLog });
    } catch (error) {
        res.status(500).json({ error: 'Log creation failed' });
    }
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve all HTML pages
app.get('/pages/:page', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', req.params.page));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
    await initDatabase();
    
    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════╗
║   🏦 Prosperity Bank Server                       ║
║   🌐 Server running on port ${PORT}                 ║
║   📁 Database: JSON file storage                  ║
║   ✅ Ready to accept connections                  ║
╚════════════════════════════════════════════════════╝
        `);
    });
}

startServer();

