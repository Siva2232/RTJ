import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import carReducer from './slices/carSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cars: carReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
});

export default store;
