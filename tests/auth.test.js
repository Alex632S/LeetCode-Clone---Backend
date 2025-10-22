import request from 'supertest';
import app from '../server.js';

describe('Authentication API', () => {
  let userToken;
  let adminToken;
  let testUser;

  // Перед всеми тестами получаем токен админа
  beforeAll(async () => {
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@leetcode.com',
        password: 'admin123'
      });
    
    adminToken = adminResponse.body.token;
  });

  test('POST /api/auth/register - should register a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.username).toBe(userData.username);
    expect(response.body.user.role).toBe('user');
    expect(response.body.user).not.toHaveProperty('passwordHash');

    // Сохраняем для следующих тестов
    testUser = response.body.user;
    userToken = response.body.token;
  });

  test('POST /api/auth/register - should fail with existing email', async () => {
    const userData = {
      username: 'anotheruser',
      email: 'testuser@example.com', // Существующий email
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty('error', 'User with this email already exists');
  });

  test('POST /api/auth/register - should fail with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'incomplete'
        // email and password missing
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/auth/login - should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('testuser@example.com');
  });

  test('POST /api/auth/login - should fail with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid email or password');
  });

  test('POST /api/auth/login - should fail with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid email or password');
  });

  test('GET /api/auth/me - should return current user with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe('testuser@example.com');
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  test('GET /api/auth/me - should fail without token', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Access token required');
  });

  test('GET /api/auth/me - should fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Invalid or expired token');
  });

  test('POST /api/auth/logout - should return success message', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Logout successful');
  });
});