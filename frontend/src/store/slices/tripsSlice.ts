import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Trip } from '../../types';

interface TripsState {
  items: Trip[];
  currentTrip: Trip | null;
  generatedItinerary: Trip | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
}

const initialState: TripsState = {
  items: [],
  currentTrip: null,
  generatedItinerary: null,
  isLoading: false,
  isGenerating: false,
  error: null,
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
    },
    setTrips: (state, action: PayloadAction<Trip[]>) => {
      state.items = action.payload;
      state.isLoading = false;
    },
    setCurrentTrip: (state, action: PayloadAction<Trip | null>) => {
      state.currentTrip = action.payload;
    },
    setGeneratedItinerary: (state, action: PayloadAction<Trip>) => {
      state.generatedItinerary = action.payload;
      state.isGenerating = false;
    },
    addTrip: (state, action: PayloadAction<Trip>) => {
      state.items.unshift(action.payload);
    },
    updateTrip: (state, action: PayloadAction<Trip>) => {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    deleteTrip: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isGenerating = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setGenerating,
  setTrips,
  setCurrentTrip,
  setGeneratedItinerary,
  addTrip,
  updateTrip,
  deleteTrip,
  setError,
  clearError,
} = tripsSlice.actions;
export default tripsSlice.reducer;
