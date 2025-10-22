let ratings = [
  {
    id: 1,
    userId: 1,
    problemId: 1,
    value: 5, // 1-5 stars
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let nextRatingId = 2;

// Добавление/обновление оценки
const upsertRating = (ratingData) => {
  const { userId, problemId, value } = ratingData;
  
  // Ищем существующую оценку
  const existingRatingIndex = ratings.findIndex(
    rating => rating.userId === userId && rating.problemId === problemId
  );

  if (existingRatingIndex !== -1) {
    // Обновляем существующую оценку
    ratings[existingRatingIndex] = {
      ...ratings[existingRatingIndex],
      value,
      updatedAt: new Date().toISOString()
    };
    return ratings[existingRatingIndex];
  } else {
    // Создаем новую оценку
    const newRating = {
      id: nextRatingId++,
      userId,
      problemId,
      value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    ratings.push(newRating);
    return newRating;
  }
};

// Получение оценки пользователя для задачи
const getUserRating = (userId, problemId) => {
  return ratings.find(rating => rating.userId === userId && rating.problemId === problemId);
};

// Получение среднего рейтинга задачи
const getAverageRating = (problemId) => {
  const problemRatings = ratings.filter(rating => rating.problemId === problemId);
  
  if (problemRatings.length === 0) return 0;
  
  const sum = problemRatings.reduce((total, rating) => total + rating.value, 0);
  return (sum / problemRatings.length).toFixed(1);
};

// Получение количества оценок для задачи
const getRatingCount = (problemId) => {
  return ratings.filter(rating => rating.problemId === problemId).length;
};

export default {
  ratings,
  upsertRating,
  getUserRating,
  getAverageRating,
  getRatingCount
};