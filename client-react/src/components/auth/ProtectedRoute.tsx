import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      console.log("Требуется авторизация");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Проверка авторизации...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 mb-4">
            Для доступа к этой странице необходимо войти в систему
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Перейти к входу
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
