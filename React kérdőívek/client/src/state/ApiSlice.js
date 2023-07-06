import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = 'http://localhost:3030';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

export const ApiSlice = createApi({
  reducerPath: 'Api',
  baseQuery,
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: 'users',
        method: 'POST',
        body,
      })
    }),
    login: builder.mutation({
      query: (body) => ({
        url: 'authentication',
        method: 'POST',
        body,
      })
    }),
    getSurveys: builder.query({
      query: (userId) => ({
        url: `surveys?userId=${userId}`,
      }),
    }),
    getSurveysWithLimits: builder.query({
      query: (limits) => ({
        url: `surveys?${limits}`,
      }),
      transformResponse: (response) => response.data,
    }),
    addSurvey: builder.mutation({
      query: (body) => ({
        url: 'surveys',
        method: 'POST',
        body,
      })
    }),
    delSurvey: builder.mutation({
      query: (surveyId) => ({
        url: `surveys/${surveyId}`,
        method: 'DELETE',
      })
    }),
    modifySurvey: builder.mutation({
      query: ({surveyId, body}) => ({
        url: `surveys/${surveyId}`,
        method: 'PATCH',
        body,
      })
    }),
    getSurveyByHash: builder.query({
      query: (hash) => ({
        url: `surveys?hash=${hash}`,
      }),
      transformResponse: (response) => response.data,
    }),
    sendAnswers: builder.mutation({
      query: (body) => ({
        url: 'results',
        method: 'POST',
        body,
      })
    }),
    getAnswers: builder.query({
      query: (surveyId) => ({
        url: `results?surveyId=${surveyId}`,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

// Reducer
export const ApiReducer = ApiSlice.reducer;

// Hooks
export const { useRegisterMutation, useLoginMutation, useGetSurveysQuery, useGetSurveysWithLimitsQuery, useAddSurveyMutation,
               useDelSurveyMutation, useModifySurveyMutation, useGetSurveyByHashQuery, useSendAnswersMutation, useGetAnswersQuery } = ApiSlice;