# LeetCode Clone API Documentation

#### Вход в систему
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Получение текущего пользователя
```http
GET /auth/me
Authorization: Bearer <token>
```

### Задачи (Problems)

#### Получить все задачи (с фильтрацией)
```http
GET /problems?search=array&difficulty=easy&tags=algorithm&minRating=4&sortBy=rating&page=1&limit=10
```

#### Получить задачу по ID
```http
GET /problems/1
```

#### Создать задачу (admin/interviewer)
```http
POST /problems
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Two Sum",
  "description": "Find two numbers...",
  "difficulty": "easy",
  "tags": ["array", "hash-table"],
  "examples": [
    {
      "input": "[2,7,11,15], 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9"
    }
  ]
}
```

#### Статистика задач
```http
GET /problems/stats/overview
```

### Комментарии

#### Получить комментарии к задаче
```http
GET /comments/problems/1
```

#### Создать комментарий
```http
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Отличная задача!",
  "problemId": 1,
  "parentId": null  // для ответов на комментарии
}
```

### Оценки

#### Поставить оценку задаче
```http
POST /ratings
Authorization: Bearer <token>
Content-Type: application/json

{
  "problemId": 1,
  "value": 5
}
```

#### Получить рейтинг задачи
```http
GET /ratings/problems/1
```

### Теги

#### Получить все теги
```http
GET /tags
```

#### Создать тег (admin)
```http
POST /tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "graph",
  "description": "Graph theory problems",
  "color": "#FFA726"
}
```

### Файлы

#### Загрузить файл (admin/interviewer)
```http
POST /files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary_file>
problemId: 1
description: "Solution explanation"
```

#### Получить файлы задачи
```http
GET /files/problem/1
```

## Модели данных

### Пользователь
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2023-10-01T10:00:00Z"
}
```

### Задача
```json
{
  "id": 1,
  "title": "Two Sum",
  "description": "Find two numbers...",
  "difficulty": "easy",
  "examples": [...],
  "tags": ["array", "hash-table"],
  "averageRating": 4.5,
  "ratingCount": 10,
  "createdAt": "2023-10-01T10:00:00Z"
}
```

### Продакшен с Docker
```bash
docker-compose up --build
```

## Документация API

Доступно по адресу: `http://localhost:3000/api`

## Тестирование

```bash
# Все тесты
npm test

# С покрытием
npm run test:coverage

# Определенный тест
npm test -- tests/auth.test.js
```

## Миграция на PostgreSQL

```bash
# Настройте .env с данными БД
node scripts/migrate.js
```

## Структура проекта

```
leetcode-clone/
├── models/          # Модели данных
├── routes/          # Маршруты API
├── middleware/      # Промежуточное ПО
├── tests/           # Автотесты
├── docs/            # Документация
├── config/          # Конфигурация
└── scripts/         # Вспомогательные скрипты
```

## Роли пользователей

- **user** - базовый доступ, комментарии, оценки
- **interviewer** - создание/редактирование задач
- **admin** - полный доступ ко всем функциям