import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Все роуты требуют аутентификации
router.use(authenticateToken);

// GET /api/users - получить всех пользователей (только для admin)
router.get('/', requireRole(['admin']), (req, res) => {
  try {
    const usersWithoutPasswords = User.users.map(user => 
      User.getUserWithoutPassword(user)
    );
    
    res.json({
      users: usersWithoutPasswords,
      total: usersWithoutPasswords.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - получить пользователя по ID
router.get('/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Пользователь может получить только свою информацию, 
    // кроме админа, который может получить любого
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied' 
      });
    }

    const user = User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(User.getUserWithoutPassword(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - обновить пользователя
router.put('/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Только сам пользователь или админ могут обновлять данные
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userIndex = User.users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = {
      ...User.users[userIndex],
      ...req.body,
      id: userId, // Не позволяем менять ID
      updatedAt: new Date().toISOString()
    };

    // Не позволяем менять роль без прав админа
    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can change roles' });
    }

    User.users[userIndex] = updatedUser;
    res.json(User.getUserWithoutPassword(updatedUser));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;