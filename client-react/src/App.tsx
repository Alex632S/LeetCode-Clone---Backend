import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Layout } from "./components/common/Layout";
import { Home } from "./pages/Home";
import { LoginForm } from "./components/auth/LoginForm";
import { Profile } from "./pages/Profile";
import { ProblemDetailPage } from "./pages/ProblemDetailPage";
import { ProblemsList } from "./pages/ProblemsList";
import { UsersList } from "./pages/UsersList";
import { InterviewerDashboard } from "./pages/InterviewerDashboard";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout showHeader={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Загрузка...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route
        path="/login"
        element={!user ? <LoginForm /> : <Navigate to="/" />}
      />

      {/* Защищенные маршруты */}
      <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
      <Route
        path="/profile"
        element={user ? <Profile /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile/:userId"
        element={user ? <Profile /> : <Navigate to="/login" />}
      />
      <Route
        path="/problems"
        element={user ? <ProblemsList /> : <Navigate to="/login" />}
      />
      <Route
        path="/problems/:problemId"
        element={user ? <ProblemDetailPage /> : <Navigate to="/login" />}
      />
      <Route
        path="/users"
        element={user ? <UsersList /> : <Navigate to="/login" />}
      />
      <Route
        path="/interviewer"
        element={user ? <InterviewerDashboard /> : <Navigate to="/login" />}
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
