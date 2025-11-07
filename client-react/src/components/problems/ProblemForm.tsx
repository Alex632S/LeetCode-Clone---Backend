import { useState, useEffect } from "react";
import type { Problem, ProblemCreate, Example } from "../../types";

interface ProblemFormProps {
  problem?: Problem;
  onSubmit: (problemData: ProblemCreate) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProblemForm({
  problem,
  onSubmit,
  onCancel,
  loading = false,
}: ProblemFormProps) {
  const [formData, setFormData] = useState<ProblemCreate>({
    title: "",
    description: "",
    difficulty: "easy",
    examples: [{ input: "", output: "", explanation: "" }],
    tags: [],
  });
  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (problem) {
      setFormData({
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        examples: problem.examples?.length
          ? problem.examples
          : [{ input: "", output: "", explanation: "" }],
        tags: problem.tags || [],
      });
    }
  }, [problem]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Название обязательно";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Описание обязательно";
    }

    // Проверка примеров
    formData.examples?.forEach((example, index) => {
      if (!example.input.trim() && example.output.trim()) {
        newErrors[`example_${index}_input`] = "Входные данные обязательны";
      }
      if (!example.output.trim() && example.input.trim()) {
        newErrors[`example_${index}_output`] = "Выходные данные обязательны";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Фильтруем пустые примеры
    const filteredExamples = formData.examples?.filter(
      (ex) => ex.input.trim() && ex.output.trim()
    );

    await onSubmit({
      ...formData,
      examples: filteredExamples?.length ? filteredExamples : undefined,
    });
  };

  const handleInputChange = (field: keyof ProblemCreate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleExampleChange = (
    index: number,
    field: keyof Example,
    value: string
  ) => {
    const newExamples = [...(formData.examples || [])];
    newExamples[index] = { ...newExamples[index], [field]: value };
    handleInputChange("examples", newExamples);

    // Очищаем ошибки для этого примера
    const errorKey = `example_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const addExample = () => {
    handleInputChange("examples", [
      ...(formData.examples || []),
      { input: "", output: "", explanation: "" },
    ]);
  };

  const removeExample = (index: number) => {
    const newExamples = formData.examples?.filter((_, i) => i !== index) || [];
    handleInputChange(
      "examples",
      newExamples.length
        ? newExamples
        : [{ input: "", output: "", explanation: "" }]
    );
  };

  const handleTagAdd = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange("tags", [...(formData.tags || []), newTag.trim()]);
      setNewTag("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      formData.tags?.filter((tag) => tag !== tagToRemove) || []
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      handleTagAdd();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Заголовок */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название задачи *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Например: Two Sum"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Описание */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          rows={6}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Подробное описание задачи..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Сложность */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Сложность *
        </label>
        <select
          value={formData.difficulty}
          onChange={(e) => handleInputChange("difficulty", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="easy">Легкая</option>
          <option value="medium">Средняя</option>
          <option value="hard">Сложная</option>
        </select>
      </div>

      {/* Примеры */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Примеры
        </label>
        <div className="space-y-4">
          {formData.examples?.map((example, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Пример {index + 1}
                </span>
                {formData.examples && formData.examples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExample(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Удалить
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Входные данные
                  </label>
                  <textarea
                    value={example.input}
                    onChange={(e) =>
                      handleExampleChange(index, "input", e.target.value)
                    }
                    rows={2}
                    className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors[`example_${index}_input`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="nums = [2,7,11,15], target = 9"
                  />
                  {errors[`example_${index}_input`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`example_${index}_input`]}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Выходные данные
                  </label>
                  <textarea
                    value={example.output}
                    onChange={(e) =>
                      handleExampleChange(index, "output", e.target.value)
                    }
                    rows={2}
                    className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      errors[`example_${index}_output`]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="[0,1]"
                  />
                  {errors[`example_${index}_output`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`example_${index}_output`]}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Объяснение (опционально)
                </label>
                <input
                  type="text"
                  value={example.explanation || ""}
                  onChange={(e) =>
                    handleExampleChange(index, "explanation", e.target.value)
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Because nums[0] + nums[1] == 9"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addExample}
          className="mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm"
        >
          + Добавить пример
        </button>
      </div>

      {/* Теги */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Теги
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите тег"
          />
          <button
            type="button"
            onClick={handleTagAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Добавить
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
        >
          {loading
            ? "Сохранение..."
            : problem
            ? "Обновить задачу"
            : "Создать задачу"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
