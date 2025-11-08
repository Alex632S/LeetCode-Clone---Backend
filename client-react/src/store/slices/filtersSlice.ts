import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FiltersState {
  problems: {
    search: string;
    tags: string[];
  };
  users: {
    search: string;
  };
}

const initialState: FiltersState = {
  problems: {
    search: "",
    tags: [],
  },
  users: {
    search: "",
  },
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    // Problems filters
    setProblemsSearch: (state, action: PayloadAction<string>) => {
      state.problems.search = action.payload;
    },
    addProblemTag: (state, action: PayloadAction<string>) => {
      if (!state.problems.tags.includes(action.payload)) {
        state.problems.tags.push(action.payload);
      }
    },
    removeProblemTag: (state, action: PayloadAction<string>) => {
      state.problems.tags = state.problems.tags.filter(
        (tag) => tag !== action.payload
      );
    },
    clearProblemTags: (state) => {
      state.problems.tags = [];
    },

    // Users filters
    setUsersSearch: (state, action: PayloadAction<string>) => {
      state.users.search = action.payload;
    },

    // Clear all filters
    clearAllFilters: (state) => {
      state.problems = initialState.problems;
      state.users = initialState.users;
    },
  },
});

export const {
  setProblemsSearch,
  addProblemTag,
  removeProblemTag,
  clearProblemTags,
  setUsersSearch,
  clearAllFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
