import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import discoveriesReducer from './slices/discoveriesSlice';
import tripsReducer from './slices/tripsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    discoveries: discoveriesReducer,
    trips: tripsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
