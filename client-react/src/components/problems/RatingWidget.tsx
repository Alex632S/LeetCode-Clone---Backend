import { useState } from "react";

interface RatingWidgetProps {
  averageRating?: number;
  ratingCount?: number;
  userRating?: number | null;
  onRate?: (rating: number) => void;
  readonly?: boolean;
}

export function RatingWidget({
  averageRating,
  ratingCount,
  userRating,
  onRate,
  readonly = false,
}: RatingWidgetProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRatingClick = (rating: number) => {
    if (!readonly && onRate) {
      onRate(rating);
    }
  };

  const displayRating = hoverRating || userRating || 0;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            className={`text-lg ${
              star <= displayRating ? "text-yellow-400" : "text-gray-300"
            } ${
              !readonly
                ? "hover:text-yellow-300 cursor-pointer"
                : "cursor-default"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        {averageRating ? (
          <span>
            {averageRating.toFixed(1)} ({ratingCount || 0}{" "}
            {getRatingWord(ratingCount || 0)})
          </span>
        ) : (
          <span>Нет оценок</span>
        )}
      </div>
    </div>
  );
}

function getRatingWord(count: number): string {
  if (count % 10 === 1 && count % 100 !== 11) return "оценка";
  if (
    count % 10 >= 2 &&
    count % 10 <= 4 &&
    (count % 100 < 10 || count % 100 >= 20)
  )
    return "оценки";
  return "оценок";
}
