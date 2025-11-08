import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import {
  fetchProblems,
  addTagToProblem,
  removeTagFromProblem,
} from "../store/slices/problemsSlice";
import {
  setProblemsSearch,
  addProblemTag,
  removeProblemTag,
  clearProblemTags,
} from "../store/slices/filtersSlice";

export function ProblemsList() {
  const dispatch = useAppDispatch();
  const { problems, loading, error } = useAppSelector(
    (state) => state.problems
  );
  const { search, tags } = useAppSelector((state: any) => state.filters.problems);

  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    dispatch(fetchProblems());
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setProblemsSearch(e.target.value));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      dispatch(addProblemTag(newTag.trim()));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    dispatch(removeProblemTag(tagToRemove));
  };

  const handleAddTagToProblem = (problemId: number, tag: string) => {
    dispatch(addTagToProblem({ problemId, tag }));
  };

  const handleRemoveTagFromProblem = (problemId: number, tag: string) => {
    dispatch(removeTagFromProblem({ problemId, tag }));
  };

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(search.toLowerCase()) ||
      problem.description.toLowerCase().includes(search.toLowerCase());
    const matchesTags =
      tags.length === 0 ||
      (problem.tags && tags.some((tag: any) => problem.tags!.includes(tag)));
    return matchesSearch && matchesTags;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Ошибка загрузки задач</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => dispatch(fetchProblems())}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Список задач</h1>

        {/* Фильтры */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            {/* Поиск */}
            <div>
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Поиск задач..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Теги */}
            <div>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="Добавить тег для фильтрации..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddTag}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Добавить
                </button>
              </div>

              {/* Выбранные теги */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any, index: any) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length > 0 && (
                  <button
                    onClick={() => dispatch(clearProblemTags())}
                    className="text-red-600 hover:text-red-800 text-xs font-medium"
                  >
                    Очистить все
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Список задач */}
        <div className="bg-white rounded-lg shadow-md">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 bg-gray-200 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProblems.map((problem) => (
                <div key={problem.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Link
                        to={`/problems/${problem.id}`}
                        className="block mb-2"
                      >
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
                          {problem.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 mb-3">
                        {problem.description}
                      </p>

                      {/* Теги задачи с возможностью управления */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {problem.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                            <button
                              onClick={() =>
                                handleRemoveTagFromProblem(problem.id, tag)
                              }
                              className="ml-1 text-gray-600 hover:text-gray-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        <button
                          onClick={() => {
                            const newTag = prompt("Введите новый тег:");
                            if (newTag) {
                              handleAddTagToProblem(problem.id, newTag);
                            }
                          }}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          + Добавить тег
                        </button>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                        <span>
                          Рейтинг: {problem.averageRating?.toFixed(1) || "Нет"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredProblems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Задачи не найдены
              </h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
