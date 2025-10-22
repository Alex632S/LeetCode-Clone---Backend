import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Временное хранилище для информации о файлах
let fileMetadata = [
  {
    id: 1,
    filename: "example-solution.pdf",
    originalName: "solution.pdf",
    path: "/uploads/example-solution.pdf",
    problemId: 1,
    uploadedBy: 1,
    fileSize: 1024,
    mimeType: "application/pdf",
    createdAt: new Date().toISOString()
  }
];

let nextFileId = 2;

// POST /api/files/upload - загрузить файл для задачи
router.post('/upload', authenticateToken, requireRole(['admin', 'interviewer']), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { problemId, description } = req.body;

    if (!problemId) {
      // Удаляем загруженный файл если problemId не указан
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Problem ID is required' });
    }

    const fileInfo = {
      id: nextFileId++,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      problemId: parseInt(problemId),
      uploadedBy: req.user.id,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      description: description || '',
      createdAt: new Date().toISOString()
    };

    fileMetadata.push(fileInfo);

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    // Удаляем файл в случае ошибки
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/files/problem/:problemId - получить файлы для задачи
router.get('/problem/:problemId', (req, res) => {
  try {
    const problemId = parseInt(req.params.problemId);
    const files = fileMetadata.filter(file => file.problemId === problemId);

    res.json({
      files: files,
      total: files.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/files/:id/download - скачать файл
router.get('/:id/download', (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const file = fileMetadata.find(f => f.id === fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(process.cwd(), file.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/files/:id - удалить файл
router.delete('/:id', authenticateToken, requireRole(['admin', 'interviewer']), (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const fileIndex = fileMetadata.findIndex(f => f.id === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = fileMetadata[fileIndex];
    
    // Проверяем права (только автор или админ)
    if (file.uploadedBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Удаляем физический файл
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Удаляем метаданные
    fileMetadata.splice(fileIndex, 1);

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;