import { useState } from "react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
  height?: string;
}

export function CodeEditor({
  code,
  onChange,
  language,
  height = "400px",
}: CodeEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        isFocused ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"
      }`}
    >
      {/* Заголовок редактора */}
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            {language.toUpperCase()}
          </span>
          <button
            onClick={() => onChange("")}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Очистить
          </button>
        </div>
      </div>

      {/* Текстовая область */}
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ height }}
        className="w-full px-4 py-3 font-mono text-sm resize-none focus:outline-none bg-white"
        placeholder={`Введите ваш код на ${language}...`}
        spellCheck={false}
      />
    </div>
  );
}
