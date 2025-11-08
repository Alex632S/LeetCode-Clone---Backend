import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usersAPI } from "../services/api";
import type { User } from "../types";

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);

      // Инициализируем рейтинги (заглушка)
      const initialRatings: Record<number, number> = {};
      response.data.users?.forEach((user) => {
        initialRatings[user.id] = 4; // Стартовый рейтинг 4
      });
      setUserRatings(initialRatings);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (userId: number, newRating: number) => {
    setUserRatings((prev) => ({
      ...prev,
      [userId]: newRating,
    }));

    // Здесь можно добавить вызов API для сохранения рейтинга
    console.log(`Updated rating for user ${userId}: ${newRating}`);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderRatingStars = (userId: number) => {
    const rating = userRatings[userId] || 0;

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(userId, star)}
            className={`text-lg ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            } hover:text-yellow-300 cursor-pointer`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Загрузка пользователей...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Список пользователей
        </h1>

        {/* Простой поиск */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск пользователей..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Список пользователей */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <Link
                    to={`/profile/${user.id}`}
                    className="flex items-center space-x-4 flex-1"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                        {user.username}
                      </h3>
                      <p className="text-gray-600">{user.email}</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "interviewer"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </Link>

                  {/* Рейтинг */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Рейтинг
                    </div>
                    {renderRatingStars(user.id)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Пользователи не найдены
              </h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
