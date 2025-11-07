import { useState, useEffect } from "react";
import { problemsAPI } from "../../services/api";
import type { Problem, ProblemCreate } from "../../types";
import { ProblemForm } from "./ProblemForm";

export function ProblemManagement() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await problemsAPI.getAll();
      setProblems(response.data.problems || []);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки задач");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (problemData: ProblemCreate) => {
    try {
      await problemsAPI.create(problemData);
      setShowForm(false);
      loadProblems(); // Перезагружаем список
    } catch (err: any) {
      console.error("Error creating problem:", err);
      throw new Error(err.message || "Ошибка создания задачи");
    }
  };

  const handleUpdateProblem = async (problemData: ProblemCreate) => {
    if (!editingProblem) return;

    try {
      await problemsAPI.update(editingProblem.id, problemData);
      setEditingProblem(null);
      loadProblems(); // Перезагружаем список
    } catch (err: any) {
      console.error("Error updating problem:", err);
      throw new Error(err.message || "Ошибка обновления задачи");
    }
  };

  const handleDeleteProblem = async (problemId: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту задачу?")) {
      return;
    }

    try {
      await problemsAPI.delete(problemId);
      loadProblems(); // Перезагружаем список
    } catch (err: any) {
      console.error("Error deleting problem:", err);
      alert("Ошибка удаления задачи");
    }
  };

  const handleEditProblem = (problem: Problem) => {
    setEditingProblem(problem);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProblem(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопка создания */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Управление задачами
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Создать задачу
        </button>
      </div>

      {/* Форма создания/редактирования */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {editingProblem ? "Редактировать задачу" : "Создать задачу"}
          </h3>
          <ProblemForm
            problem={editingProblem || undefined}
            onSubmit={
              editingProblem ? handleUpdateProblem : handleCreateProblem
            }
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Список задач */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Мои задачи</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {problems.map((problem) => (
            <div key={problem.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {problem.title}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        problem.difficulty === "easy"
                          ? "bg-green-100 text-green-800"
                          : problem.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {problem.description}
                  </p>

                  {/* Теги */}
                  {problem.tags && problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {problem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      Рейтинг: {problem.averageRating?.toFixed(1) || "Нет"}
                    </span>
                    <span>Оценок: {problem.ratingCount || 0}</span>
                    <span>
                      Создано:{" "}
                      {new Date(problem.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditProblem(problem)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDeleteProblem(problem.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {problems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Задачи не найдены
            </h3>
            <p className="text-gray-500 mb-4">Создайте свою первую задачу</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Создать задачу
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
