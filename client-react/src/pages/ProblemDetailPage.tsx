import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { problemsAPI, ratingsAPI } from "../services/api";
import type { Problem, RatingCreate } from "../types";
import { CodeEditor } from "../components/problems/CodeEditor";
import { RatingWidget } from "../components/problems/RatingWidget";

export function ProblemDetailPage() {
  const { problemId } = useParams<{ problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState("");
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (problemId) {
      loadProblem();
      loadUserRating();
    }
  }, [problemId]);

  const loadProblem = async () => {
    try {
      setLoading(true);
      const response = await problemsAPI.getById(Number(problemId));
      setProblem(response.data);
      setUserCode(
        `// Решение для: ${response.data.title}\n\nfunction solve(input) {\n  // Ваше решение здесь\n  \n}`
      );
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки задачи");
    } finally {
      setLoading(false);
    }
  };

  const loadUserRating = async () => {
    try {
      const response = await ratingsAPI.getUserRating(Number(problemId));
      if (response.data.userRating) {
        setUserRating(response.data.userRating.value);
      }
    } catch (err) {
      // Рейтинг может быть не установлен - это нормально
    }
  };

  const handleRunCode = () => {
    setOutput("Запуск кода... (в реальном приложении здесь будет вызов API)");
    // TODO: Интеграция с бэкендом для запуска кода
    setTimeout(() => {
      setOutput("✅ Код выполнен успешно!\nТесты пройдены: 3/3");
    }, 2000);
  };

  const handleSubmitCode = () => {
    setOutput(
      "Проверка решения... (в реальном приложении здесь будет вызов API)"
    );
    // TODO: Интеграция с бэкендом для отправки решения
    setTimeout(() => {
      setOutput(
        "🎉 Поздравляем! Решение принято!\nВсе тесты пройдены успешно."
      );
    }, 2000);
  };

  const handleRateProblem = async (rating: number) => {
    try {
      const ratingData: RatingCreate = {
        problemId: Number(problemId),
        value: rating,
      };
      await ratingsAPI.rateProblem(ratingData);
      setUserRating(rating);
      // Обновляем средний рейтинг
      if (problem) {
        const ratingsResponse = await ratingsAPI.getProblemRatings(
          Number(problemId)
        );
        setProblem((prev) =>
          prev
            ? {
                ...prev,
                averageRating: ratingsResponse.data.averageRating,
                ratingCount: ratingsResponse.data.ratingCount,
              }
            : null
        );
      }
    } catch (err: any) {
      console.error("Error rating problem:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Загрузка задачи...</div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || "Задача не найдена"}
          </h1>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок и мета-информация */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {problem.title}
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    problem.difficulty === "easy"
                      ? "bg-green-100 text-green-800"
                      : problem.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {problem.difficulty}
                </span>
                <RatingWidget
                  averageRating={problem.averageRating}
                  ratingCount={problem.ratingCount}
                  userRating={userRating}
                  onRate={handleRateProblem}
                />
              </div>
            </div>
          </div>

          {/* Теги */}
          {problem.tags && problem.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {problem.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка: Описание задачи */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Описание
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {problem.description}
                </p>
              </div>
            </div>

            {/* Примеры */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Примеры
                </h2>
                <div className="space-y-4">
                  {problem.examples.map((example, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Вход:
                        </span>
                        <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                          {example.input}
                        </pre>
                      </div>
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Выход:
                        </span>
                        <pre className="mt-1 bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                          {example.output}
                        </pre>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Объяснение:
                          </span>
                          <p className="mt-1 text-sm text-gray-600">
                            {example.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка: Редактор кода */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Редактор кода
                </h3>
              </div>
              <div className="p-4">
                <CodeEditor
                  code={userCode}
                  onChange={setUserCode}
                  language="javascript"
                  height="400px"
                />
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <button
                    onClick={handleRunCode}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    Запустить код
                  </button>
                  <button
                    onClick={handleSubmitCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                  >
                    Отправить решение
                  </button>
                </div>
              </div>
            </div>

            {/* Вывод */}
            {output && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Результат
                </h3>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
