/**
 * Redux store configuration using Redux Toolkit.
 * Slices: auth, interactions, ui (loading + notifications)
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import interactionsReducer from './slices/interactionsSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    interactions: interactionsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Date objects in interaction payloads
        ignoredActionPaths: ['payload.datetime', 'payload.follow_up_date', 'payload.created_at'],
        ignoredPaths: ['interactions.items'],
      },
    }),
});

export default store;
