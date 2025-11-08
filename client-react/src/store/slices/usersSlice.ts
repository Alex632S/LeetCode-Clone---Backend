import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { usersAPI } from "../../services/api";
import type { User, UsersResponse } from "../../types";

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  userRatings: Record<number, number>;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  userRatings: {},
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await usersAPI.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Ошибка загрузки пользователей"
      );
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUserRating: (
      state,
      action: PayloadAction<{ userId: number; rating: number }>
    ) => {
      state.userRatings[action.payload.userId] = action.payload.rating;
    },
    initializeUserRatings: (state) => {
      state.users.forEach((user) => {
        if (state.userRatings[user.id] === undefined) {
          state.userRatings[user.id] = 4; // Стартовый рейтинг
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUsers.fulfilled,
        (state, action: PayloadAction<UsersResponse>) => {
          state.loading = false;
          state.users = action.payload.users || [];

          // Инициализируем рейтинги для новых пользователей
          action.payload.users?.forEach((user) => {
            if (state.userRatings[user.id] === undefined) {
              state.userRatings[user.id] = 4;
            }
          });
        }
      )
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateUserRating, initializeUserRatings } =
  usersSlice.actions;
export default usersSlice.reducer;
