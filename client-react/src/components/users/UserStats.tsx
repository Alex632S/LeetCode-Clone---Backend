import type { UserStats as UserStatsType } from "@/types";

interface UserStatsProps {
  stats: UserStatsType | null;
  loading?: boolean;
}

export function UserStats({ stats, loading = false }: UserStatsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Статистика</h3>
        <div className="animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Статистика</h3>
        <div className="text-center text-gray-500 py-8">
          Статистика пока недоступна
        </div>
      </div>
    );
  }
}
