const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { login, logout, refresh, init } = require('../controllers/auth');


// log in
router.post('/login', login);

router.post('/logout', logout)

router.post('/refresh', refresh)

router.post('/init', init)

// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    console.log(rows);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;