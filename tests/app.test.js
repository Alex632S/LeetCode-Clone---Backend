import request from 'supertest';
import app from '../server.js';

describe('LeetCode Clone API', () => {
  // Тест базовых эндпоинтов
  test('GET / - should return API info', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'LeetCode Clone API');
  });

  test('GET /health - should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
  });

  test('GET /nonexistent - should return 404', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
  });
});