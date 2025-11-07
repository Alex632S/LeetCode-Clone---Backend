import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <a
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-gray-900"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LC</span>
              </div>
              <span>LeetCode Clone</span>
            </a>

            {/* Main Navigation - только для авторизованных */}
            {user && (
              <nav className="hidden md:flex space-x-6">
                <a
                  href="/"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Главная
                </a>
                <a
                  href="/profile"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Профиль
                </a>
              </nav>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Avatar and Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-3 text-sm focus:outline-none">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="font-medium text-gray-900">
                        {user.username}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user.role}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Мой профиль
                    </a>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Кнопка входа (просто текст) */
              <a
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Войти
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
