import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Layout } from "./components/common/Layout";
import { Home } from "./pages/Home";
import { LoginForm } from "./components/auth/LoginForm";
import { Profile } from "./pages/Profile";
import { ProblemDetailPage } from "./pages/ProblemDetailPage";
import { InterviewerDashboard } from "./pages/InterviewerDashboard";

function Router() {
  const { user, loading } = useAuth();
  const path = window.location.pathname;

  if (loading) {
    return (
      <Layout showHeader={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  // Главная страница - логин для неавторизованных, домашняя для авторизованных
  if (path === "/" || path === "/login") {
    return (
      <Layout showHeader={!!user}>{user ? <Home /> : <LoginForm />}</Layout>
    );
  }

  // Защищенные роуты
  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">Необходимо войти в систему</p>
            <a
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Войти
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  // Основной роутинг для авторизованных пользователей
  switch (path) {
    case "/profile":
      return (
        <Layout>
          <Profile />
        </Layout>
      );
    case "/interviewer":
      return (
        <Layout>
          <InterviewerDashboard />
        </Layout>
      );
    case path.startsWith("/problems/") ? path : "":
      const problemId = path.split("/problems/")[1];
      return (
        <Layout>
          <ProblemDetailPage />
        </Layout>
      );
    case "/":
    default:
      return (
        <Layout>
          <Home />
        </Layout>
      );
  }
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
