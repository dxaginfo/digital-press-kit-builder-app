import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  snackbar: {
    open: false,
    message: '',
    severity: 'info', // 'success', 'info', 'warning', 'error'
  },
  drawer: {
    open: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openSnackbar: (state, action) => {
      state.snackbar.open = true;
      state.snackbar.message = action.payload.message;
      state.snackbar.severity = action.payload.severity || 'info';
    },
    closeSnackbar: (state) => {
      state.snackbar.open = false;
    },
    toggleDrawer: (state) => {
      state.drawer.open = !state.drawer.open;
    },
    openDrawer: (state) => {
      state.drawer.open = true;
    },
    closeDrawer: (state) => {
      state.drawer.open = false;
    },
  },
});

export const { openSnackbar, closeSnackbar, toggleDrawer, openDrawer, closeDrawer } = uiSlice.actions;
export default uiSlice.reducer;