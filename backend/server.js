import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'neurotrade-demo-secret';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// In-memory users store
let users = [];
let nextId = 1;

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '1d' },
  );
}

function toClientUser(user) {
  return {
    id: user.id,
    username: user.name,
    displayName: user.name,
    email: user.email,
    walletBalance: user.walletBalance ?? 100000,
    accessToken: createToken(user),
  };
}

// Seed demo user if not present
function ensureDemoUser() {
  const email = 'demo@neurotrade.com';
  if (!users.find((u) => u.email === email)) {
    const user = {
      id: nextId++,
      name: 'Demo Trader',
      email,
      password: 'demo123',
      walletBalance: 100000,
    };
    users.push(user);
    console.log('[NeuroTrade Demo] Seeded demo user:', {
      email: user.email,
      password: user.password,
    });
  }
}

ensureDemoUser();

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  const user = {
    id: nextId++,
    name,
    email,
    password,
    walletBalance: 100000,
  };
  users.push(user);

  const clientUser = toClientUser(user);
  return res.status(201).json(clientUser);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const clientUser = toClientUser(user);
  return res.json(clientUser);
});

// Simple auth middleware for /me
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = users.find((u) => u.id === payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const clientUser = toClientUser(req.user);
  return res.json(clientUser);
});

app.listen(PORT, () => {
  console.log(`[NeuroTrade Demo] Node auth server running at http://localhost:${PORT}`);
});

