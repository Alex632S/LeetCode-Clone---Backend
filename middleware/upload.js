import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Создаем папку uploads если ее нет
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Фильтрация файлов по типу
const fileFilter = (req, file, cb) => {
  // Разрешаем только определенные типы файлов
  const allowedTypes = ['.pdf', '.txt', '.md', '.zip', '.java', '.py', '.js', '.cpp', '.c'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed types: ' + allowedTypes.join(', ')), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export default upload;