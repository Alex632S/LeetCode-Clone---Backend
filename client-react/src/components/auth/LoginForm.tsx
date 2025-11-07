import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { LoginRequest } from "@/types";

export function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      // После успешного входа перенаправляем на главную
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      alert("Ошибка входа. Проверьте email и пароль.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Вход в систему</h2>
          <p className="mt-2 text-gray-600">Введите ваши учетные данные</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ваш пароль"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Нет аккаунта?{" "}
            <button
              onClick={() => alert("Форма регистрации будет добавлена позже")}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
