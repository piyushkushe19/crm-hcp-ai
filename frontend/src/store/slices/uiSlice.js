/**
 * UI slice – manages global loading state and toast notifications.
 */

import { createSlice } from '@reduxjs/toolkit';

let toastId = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    globalLoading: false,
    toasts: [],          // [{ id, type, message }]
    sidebarOpen: true,
  },
  reducers: {
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload;
    },
    addToast(state, action) {
      state.toasts.push({
        id: ++toastId,
        type: action.payload.type || 'info',
        message: action.payload.message,
      });
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { setGlobalLoading, addToast, removeToast, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
