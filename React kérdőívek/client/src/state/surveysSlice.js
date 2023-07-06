import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useGetSurveysQuery } from "./ApiSlice";
const initialState = {
    list: [
        {
            content: null,
            createdAt: null,
            hash: null,
            id: null,
            name: null
        },
    ]
};

const surveysSlice = createSlice({
    name: 'surveysList',
    initialState,
    reducers: {
        setSurveys: (state, {payload: surveys}) => {
            state.list = surveys;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchSurveys.fulfilled, (state, { payload: surveys }) => {
            state.list = surveys;
        });
    }
});

// Reducer

export const surveysReducer = surveysSlice.reducer;

// Actions


// Async Actions

export const fetchSurveys = createAsyncThunk(
    'surveys/fetchSurveys',
    async (_, { getState }) => {
      const userId = getState().auth.user.id;
      const response = await useGetSurveysQuery(userId);
      return response;
    }
  );


// Selectors

export const getList = (state) => state.list;