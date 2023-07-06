import { createSlice } from "@reduxjs/toolkit";

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(`${name}=`)) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }

const initialState = { user: JSON.parse(getCookie("user")), token: getCookie("token") };

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, { payload: { user, token } }) => {
            state.user = user;
            state.token = token;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
    }
});

// Reducer
export const authReducer = authSlice.reducer;

// Actions
export const { login, logout } = authSlice.actions;

// Selectors
export const getLoggedInUser = (state) => state.auth.user;
export const getAuthToken = (state) => state.auth.token;