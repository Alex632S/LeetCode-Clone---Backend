import { useState, useEffect } from "react";
import { usersAPI } from "../services/api";
import type { UserProfile, UserStats, UserUpdateRequest } from "../types";

export function useUser(userId: number) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Загружаем основные данные пользователя
      const userResponse = await usersAPI.getById(userId);
      console.log("User API response:", userResponse.data);

      // API возвращает пользователя напрямую, а не в { user: User }
      const userData = userResponse.data;

      if (!userData) {
        throw new Error("Данные пользователя не получены");
      }

      // Временная заглушка для статистики (пока нет реального API)
      const mockStats: UserStats = {
        totalSolved: Math.floor(Math.random() * 100),
        easySolved: Math.floor(Math.random() * 50),
        mediumSolved: Math.floor(Math.random() * 30),
        hardSolved: Math.floor(Math.random() * 20),
        acceptanceRate: Math.floor(Math.random() * 30) + 70,
        ranking: Math.floor(Math.random() * 5000) + 1,
      };

      // Приводим тип User к UserProfile
      const userProfile: UserProfile = {
        ...userData,
        bio:
          userData.bio ||
          "Люблю решать алгоритмические задачи и участвовать в соревнованиях.",
        website: userData.website || "",
        github: userData.github || "https://github.com/username",
        linkedin: userData.linkedin || "https://linkedin.com/in/username",
        stats: mockStats,
      };

      setUser(userProfile);
      setStats(mockStats);
      console.log("User profile created:", userProfile);
    } catch (err: any) {
      console.error("Error in loadUserData:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Ошибка загрузки данных пользователя"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userData: UserUpdateRequest): Promise<void> => {
    try {
      const response = await usersAPI.update(userId, userData);
      const updatedUser = response.data;

      // Обновляем профиль пользователя
      setUser((prev) =>
        prev
          ? {
              ...prev,
              ...updatedUser,
              bio: updatedUser.bio || prev.bio,
              website: updatedUser.website || prev.website,
              github: updatedUser.github || prev.github,
              linkedin: updatedUser.linkedin || prev.linkedin,
            }
          : null
      );
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || err.message || "Ошибка обновления профиля"
      );
    }
  };

  const refreshUser = () => {
    loadUserData();
  };

  return {
    user,
    stats,
    loading,
    error,
    updateUser,
    refreshUser,
  };
}
