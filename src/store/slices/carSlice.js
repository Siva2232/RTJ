import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchCars = createAsyncThunk('cars/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cars', { params });
    return data.data.cars;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cars');
  }
});

export const fetchCarById = createAsyncThunk('cars/fetchById', async (carId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/cars/${carId}`);
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch car');
  }
});

export const createCarThunk = createAsyncThunk('cars/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cars', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create car');
  }
});

export const addPurchaseExpenseThunk = createAsyncThunk('cars/addPurchaseExpense', async ({ carId, expense }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/cars/${carId}/purchase-expense`, expense);
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add expense');
  }
});

export const deletePurchaseExpenseThunk = createAsyncThunk('cars/deletePurchaseExpense', async ({ carId, expenseId }, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cars/${carId}/purchase-expense/${expenseId}`);
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete expense');
  }
});

export const addRepairCostThunk = createAsyncThunk('cars/addRepairCost', async ({ carId, expense }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/cars/${carId}/repair`, expense);
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add repair cost');
  }
});

export const deleteRepairCostThunk = createAsyncThunk('cars/deleteRepairCost', async ({ carId, repairId }, { rejectWithValue }) => {
  try {
    const { data } = await api.delete(`/cars/${carId}/repair/${repairId}`);
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete repair cost');
  }
});

export const updateStatusThunk = createAsyncThunk('cars/updateStatus', async ({ carId, status }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cars/${carId}/status`, { status });
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update status');
  }
});

export const markReadyThunk = createAsyncThunk('cars/markReady', async ({ carId, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cars/${carId}/mark-ready`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark car ready');
  }
});

export const sellCarThunk = createAsyncThunk('cars/sell', async ({ carId, sellingPrice, customerDetails }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/cars/${carId}/sell`, { sellingPrice, customerDetails });
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to request sale approval');
  }
});

export const approveSaleThunk = createAsyncThunk('cars/approveSale', async ({ carId, action }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cars/${carId}/approve-sale`, { action });
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to approve/reject sale');
  }
});

export const deleteCarThunk = createAsyncThunk('cars/delete', async (carId, { rejectWithValue }) => {
  try {
    await api.delete(`/cars/${carId}`);
    return carId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete car');
  }
});

// ─── Helper to update a car in the list ──────────────────────────────────────
const upsertCar = (list, updatedCar) => {
  const idx = list.findIndex((c) => c._id === updatedCar._id);
  if (idx !== -1) {
    list[idx] = updatedCar;
  } else {
    list.push(updatedCar);
  }
};

// ─── Slice ─────────────────────────────────────────────────────────────────────
const carSlice = createSlice({
  name: 'cars',
  initialState: {
    list: [],
    selectedCar: null,
    filterStatus: 'all',
    searchQuery: '',
    sortBy: 'date',
    loading: false,
    error: null,
  },
  reducers: {
    setFilterStatus(state, action) { state.filterStatus = action.payload; },
    setSearchQuery(state, action)  { state.searchQuery  = action.payload; },
    setSortBy(state, action)       { state.sortBy       = action.payload; },
    clearSelectedCar(state)        { state.selectedCar  = null; },
  },
  extraReducers: (builder) => {
    // fetchCars
    builder.addCase(fetchCars.pending,   (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchCars.fulfilled, (state, { payload }) => { state.loading = false; state.list = payload; });
    builder.addCase(fetchCars.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; });

    // fetchCarById
    builder.addCase(fetchCarById.pending,   (state) => { state.loading = true; });
    builder.addCase(fetchCarById.fulfilled, (state, { payload }) => { state.loading = false; state.selectedCar = payload; upsertCar(state.list, payload); });
    builder.addCase(fetchCarById.rejected,  (state, { payload }) => { state.loading = false; state.error = payload; });

    // createCar
    builder.addCase(createCarThunk.fulfilled, (state, { payload }) => { state.list.unshift(payload); });

    // expense / repair / status / sell — all return updated car
    const updateCarInList = (state, { payload }) => { upsertCar(state.list, payload); if (state.selectedCar?._id === payload._id) state.selectedCar = payload; };
    builder.addCase(addPurchaseExpenseThunk.fulfilled,    updateCarInList);
    builder.addCase(deletePurchaseExpenseThunk.fulfilled, updateCarInList);
    builder.addCase(addRepairCostThunk.fulfilled,         updateCarInList);
    builder.addCase(deleteRepairCostThunk.fulfilled,      updateCarInList);
    builder.addCase(updateStatusThunk.fulfilled,          updateCarInList);
    builder.addCase(markReadyThunk.fulfilled,             updateCarInList);
    builder.addCase(sellCarThunk.fulfilled,               updateCarInList);
    builder.addCase(approveSaleThunk.fulfilled,           updateCarInList);

    // deleteCar — remove from list
    builder.addCase(deleteCarThunk.fulfilled, (state, { payload: carId }) => {
      state.list = state.list.filter((c) => c._id !== carId);
    });
  },
});

export const { setFilterStatus, setSearchQuery, setSortBy, clearSelectedCar } = carSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectAllCars    = (state) => state.cars.list;
export const selectCarsLoading = (state) => state.cars.loading;
export const selectCarsError   = (state) => state.cars.error;
export const selectSelectedCar = (state) => state.cars.selectedCar;

export const selectCarById = (carId) => (state) =>
  state.cars.list.find((c) => c._id === carId) || state.cars.selectedCar;

export const selectFilteredCars = (state) => {
  let cars = [...state.cars.list];
  const { filterStatus, searchQuery, sortBy } = state.cars;

  if (filterStatus !== 'all') {
    cars = cars.filter((c) => c.status === filterStatus);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    cars = cars.filter(
      (c) =>
        (c.model || '').toLowerCase().includes(q) ||
        (c.brand || '').toLowerCase().includes(q) ||
        (c.registrationNumber || '').toLowerCase().includes(q) ||
        (c.chassisNumber || '').toLowerCase().includes(q)
    );
  }
  if (sortBy === 'profit') {
    cars.sort((a, b) => (b.profit ?? -Infinity) - (a.profit ?? -Infinity));
  } else if (sortBy === 'cost') {
    cars.sort((a, b) => calcTotalCost(b) - calcTotalCost(a));
  } else {
    cars.sort((a, b) => new Date(b.purchaseDate || b.createdAt) - new Date(a.purchaseDate || a.createdAt));
  }
  return cars;
};

export const selectDashboardStats = (state) => {
  const cars = state.cars.list;
  const soldCars = cars.filter((c) => c.status === 'sold');
  const totalInvestment = cars.reduce((sum, c) => sum + calcTotalCost(c), 0);
  const totalRevenue    = soldCars.reduce((sum, c) => sum + (c.sellingPrice || 0), 0);
  const totalProfit     = soldCars.reduce((sum, c) => sum + calcProfit(c), 0);
  const carsInRepair    = cars.filter((c) => c.status === 'repair').length;
  const carsReady       = cars.filter((c) => c.status === 'ready').length;
  return {
    totalCars: cars.length,
    totalInvestment,
    totalRevenue,
    totalProfit,
    soldCars: soldCars.length,
    carsInRepair,
    carsReady,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const calcTotalCost = (car) => {
  const pe = (car.purchaseExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const re = (car.repairCosts     || []).reduce((s, e) => s + (e.amount || 0), 0);
  return (car.purchasePrice || 0) + pe + re;
};

export const calcProfit = (car) => {
  if (!car.sellingPrice) return 0;
  return car.sellingPrice - calcTotalCost(car);
};

export default carSlice.reducer;
