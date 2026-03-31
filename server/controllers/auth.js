const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const refreshTokenStore = new Set();

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    ACCESS_SECRET,
    { expiresIn: "1m" }
  );
}

function generateRefreshToken(user) {
  const token = jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  refreshTokenStore.add(token);
  return token;
}

const cookieOptions = {
  httpOnly: true,
  secure: false, // true in production
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

async function login(req, res) {
  console.log('hey')
  const { email, password } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, success: true, accessToken, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed', error: err.message });
  }
}


async function logout(req, res) {
  const { refreshToken } = req.cookies;
  if (refreshToken) refreshTokenStore.delete(refreshToken);
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
}

async function refresh(req, res) {
  console.log(1)
  const { refreshToken } = req.cookies;
  console.log(2)
  
  // ❌ remove refreshTokenStore.has() — Set is wiped on every server restart
  if (!refreshToken) {
    console.log(3)
    return res.status(401).json({ error: "No refresh token" });
  }

  console.log(4)
  try {
    console.log(5)
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    console.log(6)
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.sub]);
    console.log(7)
    if (rows.length === 0) return res.status(401).json({ error: "User not found" });

    console.log(8)
    const user = rows[0];

    console.log(9)
    refreshTokenStore.delete(refreshToken);
    console.log(10)
    const newRefreshToken = generateRefreshToken(user);
    console.log(11)
    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    console.log(12)
    const newAccessToken = generateAccessToken(user);
    console.log(13)
    console.log('Generated new access token for user:', user.email);
    console.log(14)
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.log(15)
    res.status(401).json({ error: "Invalid refresh token" });
  }
}

async function init(req, res) {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        return res.status(401).json({ error: "No refresh token" });
    }

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [decoded.sub]);
        if (rows.length === 0) return res.status(401).json({ error: "User not found" });

        const user = rows[0];

        refreshTokenStore.delete(refreshToken);
        const newRefreshToken = generateRefreshToken(user);
        res.cookie("refreshToken", newRefreshToken, cookieOptions);

        const newAccessToken = generateAccessToken(user);
        const { password: _, ...safeUser } = user;
        res.json({ accessToken: newAccessToken, user: safeUser });
    } catch (err) {
        res.status(401).json({ error: "Invalid refresh token" });
    }
}

module.exports = { login, logout, refresh, init };