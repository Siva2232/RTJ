import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const getStored = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginThunk = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data; // { token, user }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Invalid email or password');
  }
});

export const fetchProfileThunk = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfileThunk = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.patch('/auth/profile', formData);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getStored('carapp_user', null),
    token: localStorage.getItem('carapp_token') || null,
    isAuthenticated: !!(localStorage.getItem('carapp_token') && getStored('carapp_user', null)),
    loading: false,
    profileUpdating: false,
    error: null,
  },
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('carapp_token', action.payload.token);
      localStorage.setItem('carapp_user', JSON.stringify(action.payload.user));
    },
    logoutUser(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('carapp_token');
      localStorage.removeItem('carapp_user');
    },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('carapp_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginThunk.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.user = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('carapp_token', payload.token);
      localStorage.setItem('carapp_user', JSON.stringify(payload.user));
    });
    builder.addCase(loginThunk.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    });
    builder.addCase(fetchProfileThunk.fulfilled, (state, { payload }) => {
      state.user = { ...state.user, ...payload };
      localStorage.setItem('carapp_user', JSON.stringify(state.user));
    });
    builder.addCase(updateProfileThunk.pending, (state) => {
      state.profileUpdating = true;
      state.error = null;
    });
    builder.addCase(updateProfileThunk.fulfilled, (state, { payload }) => {
      state.profileUpdating = false;
      state.user = { ...state.user, ...payload };
      localStorage.setItem('carapp_user', JSON.stringify(state.user));
    });
    builder.addCase(updateProfileThunk.rejected, (state, { payload }) => {
      state.profileUpdating = false;
      state.error = payload;
    });
  },
});

export const fetchUsersThunk = createAsyncThunk('auth/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/users');
    return data.data.users;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
  }
});

export const registerUserThunk = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to register user');
  }
});

export const updateUserThunk = createAsyncThunk('auth/updateUser', async ({ id, ...updateData }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/auth/users/${id}`, updateData);
    return data.data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update user');
  }
});

export const { loginSuccess, logoutUser, setUser } = authSlice.actions;
export default authSlice.reducer;
