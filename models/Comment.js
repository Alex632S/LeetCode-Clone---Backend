let comments = [
  {
    id: 1,
    content: "Отличная задача для начала!",
    userId: 1,
    problemId: 1,
    parentId: null, // для вложенных комментариев
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextCommentId = 2;

// Создание комментария
const createComment = (commentData) => {
  const { content, userId, problemId, parentId = null } = commentData;
  
  const newComment = {
    id: nextCommentId++,
    content,
    userId,
    problemId,
    parentId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  comments.push(newComment);
  return newComment;
};

// Получение комментариев для задачи
const getCommentsByProblemId = (problemId) => {
  return comments.filter(comment => comment.problemId === problemId && comment.parentId === null);
};

// Получение ответов на комментарий
const getReplies = (parentId) => {
  return comments.filter(comment => comment.parentId === parentId);
};

// Получение комментария по ID
const getCommentById = (id) => {
  return comments.find(comment => comment.id === id);
};

// Обновление комментария
const updateComment = (id, content) => {
  const commentIndex = comments.findIndex(comment => comment.id === id);
  if (commentIndex === -1) return null;

  comments[commentIndex] = {
    ...comments[commentIndex],
    content,
    updatedAt: new Date().toISOString()
  };

  return comments[commentIndex];
};

// Удаление комментария
const deleteComment = (id) => {
  const commentIndex = comments.findIndex(comment => comment.id === id);
  if (commentIndex === -1) return false;

  // Удаляем также все ответы на этот комментарий
  const replies = getReplies(id);
  replies.forEach(reply => {
    const replyIndex = comments.findIndex(c => c.id === reply.id);
    if (replyIndex !== -1) {
      comments.splice(replyIndex, 1);
    }
  });

  comments.splice(commentIndex, 1);
  return true;
};

export default {
  comments,
  createComment,
  getCommentsByProblemId,
  getReplies,
  getCommentById,
  updateComment,
  deleteComment
};