import { createSlice,type PayloadAction } from "@reduxjs/toolkit";

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  city?:string;
  pincode?: string;
}
interface WorkerData {
  _id:string
  name: string;
  email: string;
  image?: string;
  location?:LocationData
}
interface WorkerState {
  worker: WorkerData | null;
}

const initialState: WorkerState = {
  worker: JSON.parse(localStorage.getItem("WorkerData") || "null"),
};

const workerTokenSlice = createSlice({
  name: "workerTokenSlice",
  initialState,
  reducers: {
    addWorker: (state, action: PayloadAction<WorkerData>) => {
      state.worker = action.payload;
      localStorage.setItem("WorkerData", JSON.stringify(action.payload));
    },
    updateLocation: (state, action: PayloadAction<LocationData>) => {
      if (state.worker) {
        state.worker.location = action.payload;
        localStorage.setItem("WorkerData", JSON.stringify(state.worker));
      }
    },
    removeWorker: (state) => {
      state.worker = null;
      localStorage.removeItem("WorkerData");
    },
  },
});

export const { addWorker, removeWorker } = workerTokenSlice.actions;
export default workerTokenSlice.reducer;