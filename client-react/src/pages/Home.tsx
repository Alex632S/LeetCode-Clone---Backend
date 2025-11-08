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
    </div>
  );
}
