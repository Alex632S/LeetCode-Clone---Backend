import request from 'supertest';
import app from '../server.js';

describe('Protected Problems API', () => {
  let userToken;
  let adminToken;
  let problemId;

  beforeAll(async () => {
    // Получаем токен обычного пользователя
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'problemuser',
        email: 'problemuser@example.com',
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
  });

  test('POST /api/problems - should create problem with admin token', async () => {
    const problemData = {
      title: "Protected Problem",
      description: "This problem requires authentication",
      difficulty: "medium",
      tags: ["algorithm", "protected"]
    };

    const response = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(problemData);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(problemData.title);
    expect(response.body.difficulty).toBe(problemData.difficulty);

    problemId = response.body.id;
  });

  test('POST /api/problems - should fail without authentication', async () => {
    const problemData = {
      title: "Unauthorized Problem",
      description: "This should fail",
      difficulty: "easy"
    };

    const response = await request(app)
      .post('/api/problems')
      .send(problemData);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Access token required');
  });

  test('POST /api/problems - should fail with user role', async () => {
    const problemData = {
      title: "User Problem",
      description: "Regular users cannot create problems",
      difficulty: "easy"
    };

    const response = await request(app)
      .post('/api/problems')
      .set('Authorization', `Bearer ${userToken}`)
      .send(problemData);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Insufficient permissions');
  });

  test('PUT /api/problems/:id - should fail without authentication', async () => {
    const response = await request(app)
      .put(`/api/problems/${problemId}`)
      .send({ title: "Updated" });

    expect(response.status).toBe(401);
  });

  test('DELETE /api/problems/:id - should fail without authentication', async () => {
    const response = await request(app)
      .delete(`/api/problems/${problemId}`);

    expect(response.status).toBe(401);
  });

  test('GET /api/problems - should work without authentication', async () => {
    const response = await request(app)
      .get('/api/problems');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('problems');
  });

  test('GET /api/problems/:id - should work without authentication', async () => {
    const response = await request(app)
      .get(`/api/problems/${problemId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(problemId);
  });
});