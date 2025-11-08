import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchUsers, updateUserRating } from "@/store/slices/usersSlice";
import { setUsersSearch } from "../store/slices/filtersSlice";

export function UsersList() {
  const dispatch = useAppDispatch();
  const { users, loading, error, userRatings } = useAppSelector(
    (state) => state.users
  );
  const { search } = useAppSelector((state) => state.filters.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUsersSearch(e.target.value));
  };

  const handleRatingChange = (userId: number, newRating: number) => {
    dispatch(updateUserRating({ userId, rating: newRating }));
  };

  const filteredUsers = users.filter(
    (user: any) =>
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
        <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">
            Ошибка загрузки пользователей
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => dispatch(fetchUsers())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Список пользователей
        </h1>

        {/* Поиск */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Поиск пользователей..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Список пользователей */}
        <div className="bg-white rounded-lg shadow-md">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user: any) => (
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
                        Рейтинг пользователя
                      </div>
                      {renderRatingStars(user.id)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
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
