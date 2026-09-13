import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Discovery } from '../../types';

interface DiscoveriesState {
  items: Discovery[];
  currentDiscovery: Discovery | null;
  filters: {
    category?: string;
    status?: string;
    city?: string;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: DiscoveriesState = {
  items: [],
  currentDiscovery: null,
  filters: {},
  isLoading: false,
  error: null,
};

const discoveriesSlice = createSlice({
  name: 'discoveries',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDiscoveries: (state, action: PayloadAction<Discovery[]>) => {
      state.items = action.payload;
      state.isLoading = false;
    },
    setCurrentDiscovery: (state, action: PayloadAction<Discovery | null>) => {
      state.currentDiscovery = action.payload;
    },
    addDiscovery: (state, action: PayloadAction<Discovery>) => {
      state.items.unshift(action.payload);
    },
    setFilters: (state, action: PayloadAction<{ category?: string; status?: string; city?: string }>) => {
      state.filters = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setDiscoveries, setCurrentDiscovery, addDiscovery, setFilters, setError, clearError } =
  discoveriesSlice.actions;
export default discoveriesSlice.reducer;
