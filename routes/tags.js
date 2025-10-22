import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Временное хранилище тегов
let tags = [
  { id: 1, name: 'array', description: 'Problems involving arrays', color: '#FF6B6B', createdAt: new Date().toISOString() },
  { id: 2, name: 'hash-table', description: 'Problems using hash tables', color: '#4ECDC4', createdAt: new Date().toISOString() },
  { id: 3, name: 'dynamic-programming', description: 'Dynamic programming problems', color: '#45B7D1', createdAt: new Date().toISOString() },
  { id: 4, name: 'string', description: 'String manipulation problems', color: '#96CEB4', createdAt: new Date().toISOString() },
  { id: 5, name: 'algorithm', description: 'General algorithm problems', color: '#FFEAA7', createdAt: new Date().toISOString() }
];

let nextTagId = 6;

// GET /api/tags - получить все теги
router.get('/', (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    let filteredTags = [...tags];
    
    // Поиск по названию тега
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTags = filteredTags.filter(tag => 
        tag.name.toLowerCase().includes(searchLower) ||
        (tag.description && tag.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTags = filteredTags.slice(startIndex, endIndex);
    
    res.json({
      tags: paginatedTags,
      total: filteredTags.length,
      page: parseInt(page),
      totalPages: Math.ceil(filteredTags.length / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tags/popular - получить популярные теги
router.get('/popular', (req, res) => {
  try {
    // В реальном приложении здесь была бы логика подсчета использования тегов
    const popularTags = tags.slice(0, 10); // Просто возвращаем первые 10
    
    res.json({
      tags: popularTags,
      total: popularTags.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tags - создать новый тег (только админ)
router.post('/', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { name, description, color } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }
    
    // Проверяем, существует ли тег с таким именем
    const existingTag = tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
    if (existingTag) {
      return res.status(409).json({ error: 'Tag with this name already exists' });
    }
    
    const newTag = {
      id: nextTagId++,
      name,
      description: description || '',
      color: color || '#6C757D',
      createdAt: new Date().toISOString()
    };
    
    tags.push(newTag);
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/tags/:id - обновить тег (только админ)
router.put('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const tagId = parseInt(req.params.id);
    const { name, description, color } = req.body;
    
    const tagIndex = tags.findIndex(tag => tag.id === tagId);
    if (tagIndex === -1) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    // Проверяем уникальность имени (если оно меняется)
    if (name && name !== tags[tagIndex].name) {
      const existingTag = tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
      if (existingTag) {
        return res.status(409).json({ error: 'Tag with this name already exists' });
      }
    }
    
    tags[tagIndex] = {
      ...tags[tagIndex],
      ...(name && { name }),
      ...(description && { description }),
      ...(color && { color })
    };
    
    res.json(tags[tagIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tags/:id - удалить тег (только админ)
router.delete('/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const tagId = parseInt(req.params.id);
    const tagIndex = tags.findIndex(tag => tag.id === tagId);
    
    if (tagIndex === -1) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    // В реальном приложении нужно проверить, используется ли тег в задачах
    tags.splice(tagIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;