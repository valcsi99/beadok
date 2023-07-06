import { configureStore } from "@reduxjs/toolkit";
import { ApiReducer, ApiSlice } from "./ApiSlice";
import { authReducer } from "./authSlice";
import { surveysReducer } from "./SurveysSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        // surveys: surveysReducer,
        [ApiSlice.reducerPath]: ApiReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ApiSlice.middleware),
});