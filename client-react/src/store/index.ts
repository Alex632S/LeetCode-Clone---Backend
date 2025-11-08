import { configureStore } from "@reduxjs/toolkit";
import problemsReducer from "./slices/problemsSlice";
import usersReducer from "./slices/usersSlice";
import filtersReducer from "./slices/filtersSlice";

export const store = configureStore({
  reducer: {
    problems: problemsReducer,
    users: usersReducer,
    filters: filtersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
