import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/comments/problems/:problemId - получить комментарии к задаче (ИСПРАВЛЕННЫЙ ПУТЬ)
router.get('/problems/:problemId', (req, res) => {
  try {
    const problemId = parseInt(req.params.problemId);
    const comments = Comment.getCommentsByProblemId(problemId);
    
    // Добавляем информацию о пользователях и ответы
    const commentsWithUsers = comments.map(comment => {
      const user = User.findUserById(comment.userId);
      const replies = Comment.getReplies(comment.id);
      
      const repliesWithUsers = replies.map(reply => {
        const replyUser = User.findUserById(reply.userId);
        return {
          ...reply,
          user: User.getUserWithoutPassword(replyUser)
        };
      });

      return {
        ...comment,
        user: User.getUserWithoutPassword(user),
        replies: repliesWithUsers
      };
    });

    res.json({
      comments: commentsWithUsers,
      total: commentsWithUsers.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/comments - создать комментарий
router.post('/', authenticateToken, (req, res) => {
  try {
    const { content, problemId, parentId = null } = req.body;
    const userId = req.user.id;

    if (!content || !problemId) {
      return res.status(400).json({ 
        error: 'Content and problemId are required' 
      });
    }

    const newComment = Comment.createComment({
      content,
      userId,
      problemId,
      parentId
    });

    const user = User.findUserById(userId);
    
    res.status(201).json({
      ...newComment,
      user: User.getUserWithoutPassword(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/comments/:id - обновить комментарий
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const { content } = req.body;
    const userId = req.user.id;

    const comment = Comment.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Проверяем, что пользователь является автором комментария
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    const updatedComment = Comment.updateComment(commentId, content);
    const user = User.findUserById(userId);

    res.json({
      ...updatedComment,
      user: User.getUserWithoutPassword(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/comments/:id - удалить комментарий
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = req.user.id;

    const comment = Comment.getCommentById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Проверяем, что пользователь является автором комментария или админом
    if (comment.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    Comment.deleteComment(commentId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;