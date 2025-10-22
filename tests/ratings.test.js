import request from 'supertest';
import app from '../server.js';

describe('Ratings API', () => {
  let userToken;
  let adminToken;
  let testProblemId;

  beforeAll(async () => {
    // Регистрируем тестового пользователя
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'ratinguser',
        email: 'ratinguser@example.com',
        password: 'password123'
      });

    userToken = userResponse.body.token;

    // Получаем токен админа
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@leetcode.com',
        password: 'admin123'
      });

    adminToken = adminResponse.body.token;

    // Создаем тестовую задачу
    const problemResponse = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: "Test Problem for Ratings",
        description: "Test problem description for ratings",
        difficulty: "medium",
        tags: ["test", "ratings"]
      });

    testProblemId = problemResponse.body.id;
  });

  test('POST /api/ratings - should add a rating', async () => {
    const ratingData = {
      problemId: testProblemId,
      value: 5
    };

    const response = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send(ratingData);

    expect(response.status).toBe(200);
    expect(response.body.rating).toHaveProperty('id');
    expect(response.body.rating.value).toBe(5);
    expect(response.body.rating.userId).toBeDefined();
    expect(response.body.rating.problemId).toBe(testProblemId);
    expect(response.body).toHaveProperty('averageRating');
    expect(response.body).toHaveProperty('ratingCount');
  });

  test('POST /api/ratings - should update existing rating', async () => {
    const ratingData = {
      problemId: testProblemId,
      value: 4 // Изменяем оценку с 5 на 4
    };

    const response = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send(ratingData);

    expect(response.status).toBe(200);
    expect(response.body.rating.value).toBe(4);
    expect(response.body.averageRating).toBe(4);
  });

  test('POST /api/ratings - should fail with invalid rating value', async () => {
    const ratingData = {
      problemId: testProblemId,
      value: 6 // Неверное значение
    };

    const response = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${userToken}`)
      .send(ratingData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Rating value must be between 1 and 5');
  });

  test('POST /api/ratings - should fail without authentication', async () => {
    const ratingData = {
      problemId: testProblemId,
      value: 3
    };

    const response = await request(app)
      .post('/api/ratings')
      .send(ratingData);

    expect(response.status).toBe(401);
  });

  test('GET /api/ratings/problems/:problemId - should get problem rating', async () => {
    const response = await request(app)
      .get(`/api/ratings/problems/${testProblemId}`); // ИСПРАВЛЕННЫЙ ПУТЬ

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('averageRating');
    expect(response.body).toHaveProperty('ratingCount');
    expect(response.body.averageRating).toBe(4); // Из предыдущего теста
    expect(response.body.ratingCount).toBe(1);
  });

  test('GET /api/ratings/problems/:problemId/my-rating - should get user rating for problem', async () => {
    const response = await request(app)
      .get(`/api/ratings/problems/${testProblemId}/my-rating`) // ИСПРАВЛЕННЫЙ ПУТЬ
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('userRating');
    expect(response.body.userRating.value).toBe(4);
  });

  test('GET /api/ratings/problems/:problemId/my-rating - should return null for no rating', async () => {
    // Создаем нового пользователя без оценок
    const newUser = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'noratinguser',
        email: 'norating@example.com',
        password: 'password123'
      });

    const newUserToken = newUser.body.token;

    const response = await request(app)
      .get(`/api/ratings/problems/${testProblemId}/my-rating`) // ИСПРАВЛЕННЫЙ ПУТЬ
      .set('Authorization', `Bearer ${newUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body.userRating).toBeNull();
  });

  test('Multiple ratings should calculate correct average', async () => {
    // Создаем еще двух пользователей для оценок
    const user2 = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'rater2',
        email: 'rater2@example.com',
        password: 'password123'
      });

    const user3 = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'rater3',
        email: 'rater3@example.com',
        password: 'password123'
      });

    // Добавляем оценки
    await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${user2.body.token}`)
      .send({ problemId: testProblemId, value: 5 });

    await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${user3.body.token}`)
      .send({ problemId: testProblemId, value: 3 });

    // Проверяем средний рейтинг (4 + 5 + 3) / 3 = 4.0
    const response = await request(app)
      .get(`/api/ratings/problems/${testProblemId}`); // ИСПРАВЛЕННЫЙ ПУТЬ

    expect(response.status).toBe(200);
    expect(response.body.averageRating).toBe(4.0);
    expect(response.body.ratingCount).toBe(3);
  });
});