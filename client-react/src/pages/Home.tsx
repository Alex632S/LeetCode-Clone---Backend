import { useAuth } from "../hooks/useAuth";

export function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            LeetCode Clone
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Платформа для практики алгоритмов и подготовки к техническим
            интервью
          </p>

          {user ? (
            <div className="space-y-6">
              <div className="space-x-4">
                <a
                  href="/profile"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                >
                  Мой профиль
                </a>
              </div>

              {/* Статистика платформы (заглушка) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-2xl font-bold text-blue-600">150+</div>
                  <div className="text-gray-600">Задач в системе</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-gray-600">Пользователей</div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-2xl font-bold text-purple-600">2k+</div>
                  <div className="text-gray-600">Решений в день</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                Войдите в систему чтобы начать решать задачи
              </p>
              <a
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-block"
              >
                Войти в систему
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      {user && (
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Возможности платформы
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Решение задач
                </h3>
                <p className="text-gray-600">
                  Практикуйте алгоритмы и структуры данных на различных языках
                  программирования
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Отслеживание прогресса
                </h3>
                <p className="text-gray-600">
                  Наблюдайте за своим прогрессом и улучшайте навыки решения
                  задач
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Рейтинги
                </h3>
                <p className="text-gray-600">
                  Соревнуйтесь с другими участниками и поднимайтесь в рейтинге
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
