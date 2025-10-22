import express from 'express';
import User from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register - регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Валидация
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    const newUser = await User.createUser({ username, email, password, role });
    const userWithoutPassword = User.getUserWithoutPassword(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login - вход пользователя
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Находим пользователя
    const user = User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Проверяем пароль
    const isPasswordValid = await User.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userWithoutPassword = User.getUserWithoutPassword(user);
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout - выход (на клиенте просто удаляем токен)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

// GET /api/auth/me - получение информации о текущем пользователе
router.get('/me', authenticateToken, (req, res) => {
  // Этот эндпоинт будет защищен middleware аутентификации
  res.json({ user: req.user });
});

export default router;