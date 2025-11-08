import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ProblemManagement } from "../components/problems/ProblemManagement";
import { UserManagement } from "../components/users/UserManagement";

export function InterviewerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"problems" | "users">("problems");

  // Проверяем права доступа
  if (!user || (user.role !== "interviewer" && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 mb-4">
            У вас нет прав для доступа к этой панели
          </p>
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            На главную
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Панель {user.role === "admin" ? "администратора" : "интервьюера"}
          </h1>
          <p className="text-gray-600 mt-2">
            Управление задачами и пользователями платформы
          </p>
        </div>

        {/* Навигация */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("problems")}
              className={`py-2 px-3 border-b-2 font-medium text-sm ${
                activeTab === "problems"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
               Управление задачами
            </button>

            {user.role === "admin" && (
              <button
                onClick={() => setActiveTab("users")}
                className={`py-2 px-3 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                 Управление пользователями
              </button>
            )}
          </nav>
        </div>

        {/* Контент */}
        <div>
          {activeTab === "problems" && <ProblemManagement />}
          {activeTab === "users" && user.role === "admin" && <UserManagement />}
        </div>
      </div>
    </div>
  );
}
