import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AdminData {
  name: string;
  email: string;
}

interface AdminState {
  admin: AdminData | null;
}

const initialState: AdminState = {
  admin: JSON.parse(localStorage.getItem('adminData') || 'null'),
};

const adminSlice = createSlice({
  name: 'adminSlice',
  initialState,
  reducers: {
    addAdmin: (state, action: PayloadAction<AdminData>) => {
      state.admin = action.payload;
      localStorage.setItem('adminData', JSON.stringify(action.payload));
    },
    removeAdmin: (state) => {
      state.admin = null;
      localStorage.removeItem('adminData');
    },
  },
});

export const { addAdmin, removeAdmin } = adminSlice.actions;
export default adminSlice.reducer;