const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const tagsRoutes = require('./routes/tags');
const publicRoutes = require('./routes/public');
const db = require('./config/db');

const app = express();
const PORT = 3000;

db.getConnection()
  .then(() => console.log('MySQL connected'))
  .catch(err => console.error('Connection failed:', err));

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL (Vite default)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/public', publicRoutes);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});