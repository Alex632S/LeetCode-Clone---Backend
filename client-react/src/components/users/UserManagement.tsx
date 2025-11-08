import { useState, useEffect } from "react";
import { usersAPI } from "../../services/api";
import type { User, UserUpdateRequest } from "../../types";

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки пользователей");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (
    userId: number,
    newRole: "user" | "interviewer" | "admin"
  ) => {
    try {
      const updateData: UserUpdateRequest = { role: newRole };
      const response = await usersAPI.update(userId, updateData);

      // response.data содержит обновленного пользователя
      const updatedUser = response.data;

      // Обновляем локальное состояние
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? updatedUser : user))
      );
      setEditingUser(null);
    } catch (err: any) {
      console.error("Error updating user role:", err);
      alert("Ошибка обновления роли пользователя");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Управление пользователями
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Пользователь
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Роль
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата регистрации
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          role: e.target.value as
                            | "user"
                            | "interviewer"
                            | "admin",
                        })
                      }
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="user">Пользователь</option>
                      <option value="interviewer">Интервьюер</option>
                      <option value="admin">Администратор</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "interviewer"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {editingUser?.id === user.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleRoleUpdate(user.id, editingUser.role)
                        }
                        className="text-green-600 hover:text-green-900"
                      >
                        Сохранить
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Отмена
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Изменить роль
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Пользователи не найдены
        </div>
      )}
    </div>
  );
}
