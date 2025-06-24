import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pressKitService from '../../services/pressKitService';

export const fetchPressKits = createAsyncThunk(
  'pressKit/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await pressKitService.getAllPressKits();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch press kits';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchPressKitById = createAsyncThunk(
  'pressKit/fetchById',
  async (id, thunkAPI) => {
    try {
      return await pressKitService.getPressKitById(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch press kit';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createPressKit = createAsyncThunk(
  'pressKit/create',
  async (pressKitData, thunkAPI) => {
    try {
      return await pressKitService.createPressKit(pressKitData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create press kit';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updatePressKit = createAsyncThunk(
  'pressKit/update',
  async ({ id, pressKitData }, thunkAPI) => {
    try {
      return await pressKitService.updatePressKit(id, pressKitData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update press kit';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deletePressKit = createAsyncThunk(
  'pressKit/delete',
  async (id, thunkAPI) => {
    try {
      await pressKitService.deletePressKit(id);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete press kit';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  pressKits: [],
  currentPressKit: null,
  isLoading: false,
  error: null,
};

const pressKitSlice = createSlice({
  name: 'pressKit',
  initialState,
  reducers: {
    clearCurrentPressKit: (state) => {
      state.currentPressKit = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPressKits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPressKits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pressKits = action.payload;
      })
      .addCase(fetchPressKits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchPressKitById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPressKitById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPressKit = action.payload;
      })
      .addCase(fetchPressKitById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createPressKit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPressKit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pressKits.push(action.payload);
        state.currentPressKit = action.payload;
      })
      .addCase(createPressKit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updatePressKit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePressKit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pressKits = state.pressKits.map((pressKit) =>
          pressKit._id === action.payload._id ? action.payload : pressKit
        );
        state.currentPressKit = action.payload;
      })
      .addCase(updatePressKit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deletePressKit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePressKit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pressKits = state.pressKits.filter(
          (pressKit) => pressKit._id !== action.payload
        );
        if (state.currentPressKit && state.currentPressKit._id === action.payload) {
          state.currentPressKit = null;
        }
      })
      .addCase(deletePressKit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPressKit, clearError } = pressKitSlice.actions;
export default pressKitSlice.reducer;