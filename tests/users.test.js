import request from 'supertest';
import app from '../server.js';

describe('Users API', () => {
  let userToken;
  let adminToken;
  let testUserId;

  beforeAll(async () => {
    // Регистрируем тестового пользователя
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'usertest',
        email: 'usertest@example.com',
        password: 'password123'
      });

    userToken = registerResponse.body.token;
    testUserId = registerResponse.body.user.id;

    // Получаем токен админа
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@leetcode.com',
        password: 'admin123'
      });

    adminToken = adminResponse.body.token;
  });

  test('GET /api/users - should return all users for admin', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBeGreaterThan(0);
    
    // Проверяем, что пароли не возвращаются
    response.body.users.forEach(user => {
      expect(user).not.toHaveProperty('passwordHash');
    });
  });

  test('GET /api/users - should fail for non-admin users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Insufficient permissions');
  });

  test('GET /api/users - should fail without authentication', async () => {
    const response = await request(app)
      .get('/api/users');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Access token required');
  });

  test('GET /api/users/:id - should return user for own profile', async () => {
    const response = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', testUserId);
    expect(response.body).toHaveProperty('email', 'usertest@example.com');
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  test('GET /api/users/:id - should return user for admin', async () => {
    const response = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testUserId);
  });

  test('GET /api/users/:id - should fail for other users', async () => {
    // Создаем еще одного пользователя
    const anotherUser = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'another',
        email: 'another@example.com',
        password: 'password123'
      });

    const anotherToken = anotherUser.body.token;

    const response = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${anotherToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Access denied');
  });

  test('GET /api/users/:id - should fail for non-existent user', async () => {
    const response = await request(app)
      .get('/api/users/9999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });

  test('PUT /api/users/:id - should update own profile', async () => {
    const updateData = {
      username: 'updateduser'
    };

    const response = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('updateduser');
    expect(response.body.email).toBe('usertest@example.com'); // email не менялся
  });

  test('PUT /api/users/:id - should fail when updating other users profile', async () => {
    const anotherUser = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'stranger',
        email: 'stranger@example.com',
        password: 'password123'
      });

    const strangerToken = anotherUser.body.token;
    const strangerId = anotherUser.body.user.id;

    const response = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${strangerToken}`)
      .send({ username: 'hacked' });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Access denied');
  });

  test('PUT /api/users/:id - should allow admin to update any user', async () => {
    const updateData = {
      username: 'adminupdated'
    };

    const response = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe('adminupdated');
  });

  test('PUT /api/users/:id - should not allow role change for non-admin', async () => {
    const response = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ role: 'admin' });

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Only admin can change roles');
  });

  test('PUT /api/users/:id - should allow admin to change roles', async () => {
    const response = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'interviewer' });

    expect(response.status).toBe(200);
    expect(response.body.role).toBe('interviewer');
  });
});