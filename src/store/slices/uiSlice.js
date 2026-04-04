import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    activeModal: null, // 'addCar' | 'addPurchaseExpense' | 'addRepairExpense' | 'sellCar' | null
    modalCarId: null,
    loading: false,
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action) {
      state.sidebarCollapsed = action.payload;
    },
    openModal(state, action) {
      state.activeModal = action.payload.modal;
      state.modalCarId = action.payload.carId || null;
    },
    closeModal(state) {
      state.activeModal = null;
      state.modalCarId = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarCollapsed, openModal, closeModal, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
