/**
 * Interactions slice – CRUD operations for HCP interaction records.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ── Async Thunks ───────────────────────────────────────────

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/interactions');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch interactions');
    }
  }
);

export const logInteraction = createAsyncThunk(
  'interactions/log',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/interactions/log', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to log interaction');
    }
  }
);

export const editInteraction = createAsyncThunk(
  'interactions/edit',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/interactions/edit/${id}`, updates);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update interaction');
    }
  }
);

export const deleteInteraction = createAsyncThunk(
  'interactions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/interactions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to delete interaction');
    }
  }
);

export const seedInteractions = createAsyncThunk(
  'interactions/seed',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/interactions/seed');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Seed failed');
    }
  }
);

// ── Slice ──────────────────────────────────────────────────

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState: {
    items: [],
    loading: false,
    error: null,
    selectedId: null,
  },
  reducers: {
    setSelectedId(state, action) {
      state.selectedId = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchInteractions.pending, (state) => { state.loading = true; });
    builder.addCase(fetchInteractions.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchInteractions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Log (create)
    builder.addCase(logInteraction.fulfilled, (state, action) => {
      state.items.unshift(action.payload); // prepend (newest first)
    });

    // Edit
    builder.addCase(editInteraction.fulfilled, (state, action) => {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    });

    // Delete
    builder.addCase(deleteInteraction.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    });
  },
});

export const { setSelectedId, clearError } = interactionsSlice.actions;
export default interactionsSlice.reducer;
