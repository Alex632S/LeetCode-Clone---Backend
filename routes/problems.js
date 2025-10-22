import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import Rating from '../models/Rating.js';

const router = express.Router();

// Временное хранилище в памяти
let problems = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    difficulty: "easy",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    tags: ["array", "hash-table"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextId = 2;

// GET /api/problems - получить все задачи (публичный)
router.get('/', (req, res) => {
  try {
    const { 
      difficulty, 
      tags, 
      search, 
      minRating, 
      maxRating,
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let filteredProblems = [...problems];
    
    // Фильтрация по сложности
    if (difficulty) {
      filteredProblems = filteredProblems.filter(p => p.difficulty === difficulty);
    }
    
    // Фильтрация по тегам
    if (tags) {
      const tagArray = tags.split(',');
      filteredProblems = filteredProblems.filter(p => 
        tagArray.some(tag => p.tags.includes(tag))
      );
    }
    
    // Поиск по названию и описанию
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProblems = filteredProblems.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Фильтрация по рейтингу
    if (minRating || maxRating) {
      filteredProblems = filteredProblems.filter(p => {
        const avgRating = parseFloat(Rating.getAverageRating(p.id));
        if (minRating && avgRating < parseFloat(minRating)) return false;
        if (maxRating && avgRating > parseFloat(maxRating)) return false;
        return true;
      });
    }
    
    // Сортировка
    filteredProblems.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'difficulty':
          const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
          aValue = difficultyOrder[a.difficulty] || 0;
          bValue = difficultyOrder[b.difficulty] || 0;
          break;
        case 'rating':
          aValue = parseFloat(Rating.getAverageRating(a.id));
          bValue = parseFloat(Rating.getAverageRating(b.id));
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
    
    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedProblems = filteredProblems.slice(startIndex, endIndex);
    
    // Добавляем рейтинги к задачам
    const problemsWithRatings = paginatedProblems.map(problem => ({
      ...problem,
      averageRating: parseFloat(Rating.getAverageRating(problem.id)),
      ratingCount: Rating.getRatingCount(problem.id)
    }));
    
    res.json({
      problems: problemsWithRatings,
      total: filteredProblems.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredProblems.length / limit),
      hasNext: endIndex < filteredProblems.length,
      hasPrev: startIndex > 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавляем новый эндпоинт для получения статистики
router.get('/stats/overview', (req, res) => {
  try {
    const totalProblems = problems.length;
    
    const byDifficulty = problems.reduce((acc, problem) => {
      acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
      return acc;
    }, {});
    
    // Собираем все теги
    const allTags = problems.flatMap(p => p.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});
    
    // Самые популярные теги
    const popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    
    res.json({
      totalProblems,
      byDifficulty,
      popularTags,
      totalTags: Object.keys(tagCounts).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/problems/:id - получить задачу по ID (публичный)
router.get('/:id', (req, res) => {
  try {
    const problemId = parseInt(req.params.id);
    const problem = problems.find(p => p.id === problemId);
    
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // Добавляем рейтинг
    const problemWithRating = {
      ...problem,
      averageRating: parseFloat(Rating.getAverageRating(problemId)),
      ratingCount: Rating.getRatingCount(problemId)
    };
    
    res.json(problemWithRating);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/problems - создать новую задачу (только admin/interviewer)
router.post('/', authenticateToken, requireRole(['admin', 'interviewer']), (req, res) => {
  try {
    const { title, description, difficulty, examples, tags } = req.body;
    
    // Простая валидация
    if (!title || !description || !difficulty) {
      return res.status(400).json({ 
        error: 'Title, description and difficulty are required' 
      });
    }
    
    const newProblem = {
      id: nextId++,
      title,
      description,
      difficulty,
      examples: examples || [],
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    problems.push(newProblem);
    res.status(201).json(newProblem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/problems/:id - обновить задачу (только admin/interviewer)
router.put('/:id', authenticateToken, requireRole(['admin', 'interviewer']), (req, res) => {
  try {
    const problemId = parseInt(req.params.id);
    const problemIndex = problems.findIndex(p => p.id === problemId);
    
    if (problemIndex === -1) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const updatedProblem = {
      ...problems[problemIndex],
      ...req.body,
      id: problemId, // Не позволяем менять ID
      updatedAt: new Date().toISOString()
    };
    
    problems[problemIndex] = updatedProblem;
    res.json(updatedProblem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/problems/:id - удалить задачу (только admin/interviewer)
router.delete('/:id', authenticateToken, requireRole(['admin', 'interviewer']), (req, res) => {
  try {
    const problemId = parseInt(req.params.id);
    const problemIndex = problems.findIndex(p => p.id === problemId);
    
    if (problemIndex === -1) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    problems.splice(problemIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;