import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import problemRoutes from './routes/problems.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import commentRoutes from './routes/comments.js';
import ratingRoutes from './routes/ratings.js';
import fileRoutes from './routes/files.js';
import tagRoutes from './routes/tags.js';
import docsRoutes from './routes/docs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'LeetCode Clone API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Подключаем роуты задач
app.use('/api/problems', problemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/docs', docsRoutes);

// Добавляем статическую раздачу файлов
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Запускаем сервер только если файл запущен напрямую
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 LeetCode Clone API v1.0.0`);
  });
}

// Экспортируем app для тестов
export default app;