import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";
import type { UserUpdateRequest } from "../types";
import { UserStats } from "../components/users/UserStats";
import { EditProfileForm } from "../components/users/EditProfileForm";

export function Profile() {
  const { user: currentUser, logout } = useAuth();
  const { user, stats, loading, error, updateUser, refreshUser } = useUser(
    currentUser?.id || 0
  );
  const [editing, setEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleSaveProfile = async (data: UserUpdateRequest) => {
    try {
      setUpdateError(null);
      await updateUser(data);
      setEditing(false);
      refreshUser();
    } catch (err: any) {
      setUpdateError(err.message);
      throw err;
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setUpdateError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Загрузка профиля...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">
            Ошибка загрузки профиля
          </div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Профиль не найден</div>
          <p className="text-gray-600 mb-4">
            Не удалось загрузить данные пользователя
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Error Message */}
        {updateError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{updateError}</div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.username}
              </h1>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                disabled={editing}
              >
                Редактировать
              </button>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Выйти
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user.role === "interviewer"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role}
                </span>
                <span className="text-sm text-gray-500">
                  Участник с{" "}
                  {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                </span>
              </div>

              {user.bio && <p className="text-gray-700">{user.bio}</p>}
            </div>
          </div>
        </div>

        {/* Edit Form or Stats */}
        {editing ? (
          <EditProfileForm
            user={user}
            onSave={handleSaveProfile}
            onCancel={handleCancelEdit}
          />
        ) : (
          <UserStats stats={stats} loading={loading} />
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Последняя активность
          </h3>
          <div className="text-gray-500 text-center py-8">
            История решений будет отображаться здесь
          </div>
        </div>
      </div>
    </div>
  );
}
