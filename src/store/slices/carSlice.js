import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../../services/api';

const STALE_MS = 45_000;

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchCars = createAsyncThunk(
  'cars/fetchAll',
  async (options = {}, { rejectWithValue }) => {
    try {
      const { force: _force, ...params } = typeof options === 'object' ? options : {};
      const { data } = await api.get('/cars', { params: { limit: 500, ...params } });
      return data.data.cars;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch cars');
    }
  },
  {
    condition: (options = {}, { getState }) => {
      if (options?.force) return true;
      const { cars } = getState();
      if (cars.list.length > 0 && cars.lastFetchedAt && Date.now() - cars.lastFetchedAt < STALE_MS) {
        return false;
      }
      return true;
    },
  }
);

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
    const { data } = await api.post('/cars', formData);
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
    const { data } = await api.put(`/cars/${carId}/mark-ready`, formData);
    return data.data.car;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark car ready');
  }
});

export const sellCarThunk = createAsyncThunk('cars/sell', async ({ carId, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.post(`/cars/${carId}/sell`, formData);
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
    listLoading: false,
    detailLoading: false,
    error: null,
    lastFetchedAt: null,
  },
  reducers: {
    setFilterStatus(state, action) { state.filterStatus = action.payload; },
    setSearchQuery(state, action)  { state.searchQuery  = action.payload; },
    setSortBy(state, action)       { state.sortBy       = action.payload; },
    clearSelectedCar(state)        { state.selectedCar  = null; },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCars.pending, (state) => {
      state.error = null;
      if (state.list.length === 0) state.listLoading = true;
    });
    builder.addCase(fetchCars.fulfilled, (state, { payload }) => {
      state.listLoading = false;
      state.list = payload;
      state.lastFetchedAt = Date.now();
    });
    builder.addCase(fetchCars.rejected, (state, { payload }) => {
      state.listLoading = false;
      state.error = payload;
    });

    builder.addCase(fetchCarById.pending, (state) => { state.detailLoading = true; });
    builder.addCase(fetchCarById.fulfilled, (state, { payload }) => {
      state.detailLoading = false;
      state.selectedCar = payload;
      upsertCar(state.list, payload);
    });
    builder.addCase(fetchCarById.rejected, (state, { payload }) => {
      state.detailLoading = false;
      state.error = payload;
    });

    builder.addCase(createCarThunk.fulfilled, (state, { payload }) => { state.list.unshift(payload); });

    const updateCarInList = (state, { payload }) => {
      upsertCar(state.list, payload);
      if (state.selectedCar?._id === payload._id) state.selectedCar = payload;
    };
    builder.addCase(addPurchaseExpenseThunk.fulfilled,    updateCarInList);
    builder.addCase(deletePurchaseExpenseThunk.fulfilled, updateCarInList);
    builder.addCase(addRepairCostThunk.fulfilled,         updateCarInList);
    builder.addCase(deleteRepairCostThunk.fulfilled,      updateCarInList);
    builder.addCase(updateStatusThunk.fulfilled,          updateCarInList);
    builder.addCase(markReadyThunk.fulfilled,             updateCarInList);
    builder.addCase(sellCarThunk.fulfilled,               updateCarInList);
    builder.addCase(approveSaleThunk.fulfilled,           updateCarInList);

    builder.addCase(deleteCarThunk.fulfilled, (state, { payload: carId }) => {
      state.list = state.list.filter((c) => c._id !== carId);
    });
  },
});

export const { setFilterStatus, setSearchQuery, setSortBy, clearSelectedCar } = carSlice.actions;

// ─── Helpers (exported for selectors) ─────────────────────────────────────────
export const calcTotalCost = (car) => {
  const pe = (car.purchaseExpenses || []).reduce((s, e) => s + (e.amount || 0), 0);
  const re = (car.repairCosts     || []).reduce((s, e) => s + (e.amount || 0), 0);
  return (car.purchasePrice || 0) + pe + re;
};

export const calcProfit = (car) => {
  if (!car.sellingPrice) return 0;
  return car.sellingPrice - calcTotalCost(car);
};

const getUserId = (user) => {
  if (!user) return null;
  if (typeof user === 'string') return user;
  return String(user._id || user.id || '');
};

/** Per-user purchase stats from car list (purchasedBy) */
export const aggregatePurchaseStatsByUser = (cars) => {
  const map = new Map();
  for (const car of cars) {
    const id = getUserId(car.purchasedBy);
    if (!id) continue;
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: car.purchasedBy?.name || 'Unknown',
        role: car.purchasedBy?.role || 'purchase',
        total: 0,
        active: 0,
        sold: 0,
        investment: 0,
      });
    }
    const s = map.get(id);
    s.total += 1;
    if (car.status === 'sold') s.sold += 1;
    else s.active += 1;
    s.investment += car.purchasePrice || 0;
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
};

/** Per-user sales stats from car list (soldBy + sale pending) */
export const aggregateSalesStatsByUser = (cars) => {
  const map = new Map();
  const ensure = (user) => {
    const id = getUserId(user);
    if (!id) return null;
    if (!map.has(id)) {
      map.set(id, {
        id,
        name: user?.name || 'Unknown',
        role: user?.role || 'sales',
        sold: 0,
        pending: 0,
        revenue: 0,
        profit: 0,
      });
    }
    return map.get(id);
  };

  for (const car of cars) {
    if (car.status === 'sold') {
      const s = ensure(car.soldBy);
      if (!s) continue;
      s.sold += 1;
      s.revenue += car.sellingPrice || 0;
      s.profit += calcProfit(car);
    } else if (car.status === 'sale_pending') {
      const s = ensure(car.saleApproval?.requestedBy);
      if (s) s.pending += 1;
    }
  }
  return [...map.values()].sort((a, b) => b.sold - a.sold || b.pending - a.pending);
};

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectAllCars     = (state) => state.cars.list;
export const selectCarsLoading   = (state) => state.cars.listLoading;
export const selectDetailLoading = (state) => state.cars.detailLoading;
export const selectCarsError     = (state) => state.cars.error;
export const selectSelectedCar   = (state) => state.cars.selectedCar;

export const selectCarById = (carId) => (state) =>
  state.cars.list.find((c) => c._id === carId) || state.cars.selectedCar;

export const selectPendingSaleCars = createSelector(
  [selectAllCars],
  (cars) => cars.filter((c) => c.status === 'sale_pending')
);

export const selectFilteredCars = createSelector(
  [
    selectAllCars,
    (state) => state.cars.filterStatus,
    (state) => state.cars.searchQuery,
    (state) => state.cars.sortBy,
  ],
  (list, filterStatus, searchQuery, sortBy) => {
    let cars = [...list];

    if (filterStatus === 'junk') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      cars = cars.filter((c) =>
        c.status !== 'sold' &&
        new Date(c.purchaseDate || c.createdAt) <= oneYearAgo
      );
    } else if (filterStatus === '1m' || filterStatus === '3m' || filterStatus === '6m') {
      const months = parseInt(filterStatus);
      const dateLimit = new Date();
      dateLimit.setMonth(dateLimit.getMonth() - months);
      cars = cars.filter((c) =>
        c.status !== 'sold' &&
        new Date(c.purchaseDate || c.createdAt) <= dateLimit
      );
    } else if (filterStatus !== 'all') {
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
  }
);

export const selectDashboardStats = createSelector([selectAllCars], (cars) => {
  const soldCars = cars.filter((c) => c.status === 'sold');
  const totalInvestment = cars.reduce((sum, c) => sum + calcTotalCost(c), 0);
  const totalRevenue    = soldCars.reduce((sum, c) => sum + (c.sellingPrice || 0), 0);
  const totalProfit     = soldCars.reduce((sum, c) => sum + calcProfit(c), 0);
  return {
    totalCars: cars.length,
    totalInvestment,
    totalRevenue,
    totalProfit,
    soldCars: soldCars.length,
    carsInRepair: cars.filter((c) => c.status === 'repair').length,
    carsReady: cars.filter((c) => c.status === 'ready').length,
  };
});

export default carSlice.reducer;
