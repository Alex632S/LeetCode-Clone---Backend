import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Rating from '../models/Rating.js';

const router = express.Router();

// POST /api/ratings - добавить/обновить оценку
router.post('/', authenticateToken, (req, res) => {
  try {
    const { problemId, value } = req.body;
    const userId = req.user.id;

    if (!problemId || !value) {
      return res.status(400).json({ 
        error: 'ProblemId and value are required' 
      });
    }

    if (value < 1 || value > 5) {
      return res.status(400).json({ 
        error: 'Rating value must be between 1 and 5' 
      });
    }

    const rating = Rating.upsertRating({
      userId,
      problemId,
      value
    });

    const averageRating = Rating.getAverageRating(problemId);
    const ratingCount = Rating.getRatingCount(problemId);

    res.json({
      rating,
      averageRating: parseFloat(averageRating),
      ratingCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ratings/problems/:problemId - получить рейтинг задачи (ИСПРАВЛЕННЫЙ ПУТЬ)
router.get('/problems/:problemId', (req, res) => {
  try {
    const problemId = parseInt(req.params.problemId);
    
    const averageRating = Rating.getAverageRating(problemId);
    const ratingCount = Rating.getRatingCount(problemId);
    
    // Получаем оценку текущего пользователя, если он авторизован
    let userRating = null;
    if (req.user) {
      userRating = Rating.getUserRating(req.user.id, problemId);
    }

    res.json({
      averageRating: parseFloat(averageRating),
      ratingCount,
      userRating
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/ratings/problems/:problemId/my-rating - получить свою оценку для задачи (ИСПРАВЛЕННЫЙ ПУТЬ)
router.get('/problems/:problemId/my-rating', authenticateToken, (req, res) => {
  try {
    const problemId = parseInt(req.params.problemId);
    const userId = req.user.id;

    const userRating = Rating.getUserRating(userId, problemId);
    
    res.json({
      userRating: userRating || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;