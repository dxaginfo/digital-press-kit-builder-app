import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pressKitReducer from './slices/pressKitSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    pressKit: pressKitReducer,
    ui: uiReducer,
  },
});

export default store;