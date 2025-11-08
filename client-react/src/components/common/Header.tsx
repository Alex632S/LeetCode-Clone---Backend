import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Лого и навигация */}
          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900"
            >
              <span>LeetCode Clone</span>
            </Link>

            {/* Основная навигация */}
            {user && (
              <nav className="hidden md:flex space-x-6">
                <Link
                  to="/problems"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Задачи
                </Link>
                <Link
                  to="/users"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Пользователи
                </Link>
                {user.role !== "user" && (
                  <Link
                    to="/interviewer"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Панель управления
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Меню пользователя */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Профиль
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
