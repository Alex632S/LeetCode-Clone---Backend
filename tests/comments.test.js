import request from 'supertest';
import app from '../server.js';

describe('Comments API', () => {
  let userToken;
  let adminToken;
  let testProblemId;
  let testCommentId;

  beforeAll(async () => {
    // Регистрируем тестового пользователя
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'commentuser',
        email: 'commentuser@example.com',
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
        title: "Test Problem for Comments",
        description: "Test problem description",
        difficulty: "easy",
        tags: ["test", "comments"]
      });

    testProblemId = problemResponse.body.id;
  });

  test('POST /api/comments - should create a new comment', async () => {
    const commentData = {
      content: "This is a test comment",
      problemId: testProblemId
    };

    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send(commentData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.content).toBe(commentData.content);
    expect(response.body.problemId).toBe(testProblemId);
    expect(response.body.userId).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.username).toBe('commentuser');

    testCommentId = response.body.id;
  });

  test('POST /api/comments - should create a reply comment', async () => {
    const replyData = {
      content: "This is a reply to the test comment",
      problemId: testProblemId,
      parentId: testCommentId
    };

    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send(replyData);

    expect(response.status).toBe(201);
    expect(response.body.content).toBe(replyData.content);
    expect(response.body.parentId).toBe(testCommentId);
  });

  test('GET /api/comments/problems/:problemId - should get comments for a problem', async () => {
    const response = await request(app)
      .get(`/api/comments/problems/${testProblemId}`); // ИСПРАВЛЕННЫЙ ПУТЬ

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('comments');
    expect(response.body).toHaveProperty('total');
    expect(Array.isArray(response.body.comments)).toBe(true);
    expect(response.body.comments.length).toBeGreaterThan(0);
    
    // Проверяем структуру комментария
    const comment = response.body.comments[0];
    expect(comment).toHaveProperty('id');
    expect(comment).toHaveProperty('content');
    expect(comment).toHaveProperty('user');
    expect(comment).toHaveProperty('replies');
    expect(Array.isArray(comment.replies)).toBe(true);
  });

  test('PUT /api/comments/:id - should update own comment', async () => {
    const updateData = {
      content: "Updated comment content"
    };

    const response = await request(app)
      .put(`/api/comments/${testCommentId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.content).toBe(updateData.content);
    expect(response.body.id).toBe(testCommentId);
  });

  test('PUT /api/comments/:id - should fail when updating other user comment', async () => {
    // Создаем другого пользователя
    const anotherUser = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'anothercommentuser',
        email: 'anothercomment@example.com',
        password: 'password123'
      });

    const anotherToken = anotherUser.body.token;

    const updateData = {
      content: "Trying to update someone else's comment"
    };

    const response = await request(app)
      .put(`/api/comments/${testCommentId}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send(updateData);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'You can only edit your own comments');
  });

  test('DELETE /api/comments/:id - should delete own comment', async () => {
    // Сначала создаем комментарий для удаления
    const commentResponse = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: "Comment to delete",
        problemId: testProblemId
      });

    const commentIdToDelete = commentResponse.body.id;

    const response = await request(app)
      .delete(`/api/comments/${commentIdToDelete}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(204);
  });

  test('DELETE /api/comments/:id - should allow admin to delete any comment', async () => {
    // Создаем комментарий от обычного пользователя
    const commentResponse = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        content: "Comment for admin to delete",
        problemId: testProblemId
      });

    const commentId = commentResponse.body.id;

    const response = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });

  test('POST /api/comments - should fail without authentication', async () => {
    const commentData = {
      content: "Unauthorized comment",
      problemId: testProblemId
    };

    const response = await request(app)
      .post('/api/comments')
      .send(commentData);

    expect(response.status).toBe(401);
  });

  test('POST /api/comments - should fail with missing fields', async () => {
    const response = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        // content missing
        problemId: testProblemId
      });

    expect(response.status).toBe(400);
  });
});