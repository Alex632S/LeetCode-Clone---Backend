import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { problemsAPI } from "../../services/api";
import type { Problem, ProblemsResponse, ProblemCreate } from "../../types";

interface ProblemsState {
  problems: Problem[];
  loading: boolean;
  error: string | null;
}

const initialState: ProblemsState = {
  problems: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchProblems = createAsyncThunk(
  "problems/fetchProblems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await problemsAPI.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Ошибка загрузки задач"
      );
    }
  }
);

export const createProblem = createAsyncThunk(
  "problems/createProblem",
  async (problemData: ProblemCreate, { rejectWithValue }) => {
    try {
      const response = await problemsAPI.create(problemData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Ошибка создания задачи"
      );
    }
  }
);

const problemsSlice = createSlice({
  name: "problems",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addTagToProblem: (
      state,
      action: PayloadAction<{ problemId: number; tag: string }>
    ) => {
      const problem = state.problems.find(
        (p) => p.id === action.payload.problemId
      );
      if (problem && problem.tags) {
        if (!problem.tags.includes(action.payload.tag)) {
          problem.tags.push(action.payload.tag);
        }
      }
    },
    removeTagFromProblem: (
      state,
      action: PayloadAction<{ problemId: number; tag: string }>
    ) => {
      const problem = state.problems.find(
        (p) => p.id === action.payload.problemId
      );
      if (problem && problem.tags) {
        problem.tags = problem.tags.filter((tag) => tag !== action.payload.tag);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch problems
      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProblems.fulfilled,
        (state, action: PayloadAction<ProblemsResponse>) => {
          state.loading = false;
          state.problems = action.payload.problems || [];
        }
      )
      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create problem
      .addCase(createProblem.fulfilled, (state, action) => {
        state.problems.unshift(action.payload);
      })
      .addCase(createProblem.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, addTagToProblem, removeTagFromProblem } =
  problemsSlice.actions;
export default problemsSlice.reducer;
