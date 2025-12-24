/**
 * Prosperity Bank - Server.js Backend
 * Mini database using JSON file storage
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

const DB_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');

async function initDatabase() {
    try {
        await fs.mkdir(DB_DIR, { recursive: true });
        try {
            await fs.access(USERS_FILE);
        } catch {
            // Create multiple demo users on first load
            const initialUsers = [
                {
                    id: 1,
                    username: 'demo_admin',
                    password: 'demo123',
                    email: 'admin@prosperitybank.com',
                    fullName: 'Admin Demo User',
                    accounts: [{ type: 'checking', name: 'Advantage Plus', number: '****9876', balance: 25000.00 }],
                    transactions: [{ id: 'tx1', date: new Date().toISOString().split('T')[0], type: 'Deposit', amount: 25000, desc: 'Initial Admin Credit', status: 'status-success' }],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    username: 'test_user',
                    password: 'demo123',
                    email: 'test@prosperitybank.com',
                    fullName: 'Test Demo User',
                    accounts: [{ type: 'checking', name: 'Basic Checking', number: '****1234', balance: 500.00 }],
                    transactions: [],
                    createdAt: new Date().toISOString()
                }
            ];
            await fs.writeFile(USERS_FILE, JSON.stringify(initialUsers, null, 2));
        }
        console.log('✅ Database initialized with demo users');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

async function readJSON(filepath) {
    try {
        const data = await fs.readFile(filepath, 'utf8');
        return JSON.parse(data);
    } catch (error) { return []; }
}

async function writeJSON(filepath, data) {
    try {
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) { return false; }
}

// REGISTER: Converts every new user into a "Demo" user structure
app.post('/api/register', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const { username, password, email, fullName } = req.body;
        
        if (users.some(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        const newUser = {
            id: Date.now(),
            username,
            password,
            email: email || `${username}@prosperitybank.com`,
            fullName: fullName || username,
            accounts: [
                {
                    type: 'checking',
                    name: 'Demo Checking Account',
                    number: '****' + Math.floor(1000 + Math.random() * 9000),
                    balance: 1000.00 
                }
            ],
            transactions: [
                {
                    id: 'tx_' + Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    type: 'Deposit',
                    amount: 1000.00,
                    desc: 'New Account Welcome Credit',
                    status: 'status-success'
                }
            ],
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await writeJSON(USERS_FILE, users);
        res.json({ success: true, user: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.get('/api/users', async (req, res) => {
    const users = await readJSON(USERS_FILE);
    res.json(users.map(({ password, ...u }) => u));
});

app.get('/api/users/:id', async (req, res) => {
    const users = await readJSON(USERS_FILE);
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

app.put('/api/users/:id/balance', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
        if (userIndex === -1) return res.status(404).json({ error: 'Not found' });

        const { newBalance } = req.body;
        const accIndex = users[userIndex].accounts.findIndex(a => a.type === 'checking');
        
        if (accIndex !== -1) {
            users[userIndex].accounts[accIndex].balance = parseFloat(newBalance);
            await writeJSON(USERS_FILE, users);
            res.json({ success: true, balance: newBalance });
        } else {
            res.status(400).json({ error: 'Checking account not found' });
        }
    } catch (error) { res.status(500).json({ error: 'Update failed' }); }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

async function startServer() {
    await initDatabase();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
startServer();
