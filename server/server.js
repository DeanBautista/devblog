const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const tagsRoutes = require('./routes/tags');
const dashboardRoutes = require('./routes/dashboard');
const publicRoutes = require('./routes/public');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://devblog-lemon.vercel.app',
];

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
};

db.getConnection()
  .then(() => console.log('MySQL connected'))
  .catch(err => console.error('Connection failed:', err));

// Middleware
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/public', publicRoutes);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});