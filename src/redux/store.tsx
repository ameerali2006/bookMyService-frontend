import { configureStore } from "@reduxjs/toolkit";
import userTokenSlice from "./slice/userTokenSlice";
import adminTokenSlice from "./slice/adminTokenSlice";
import workerTokenSlice from "./slice/workerTokenSlice";
const store=configureStore({
  reducer:{
    userTokenSlice:userTokenSlice,
    workerTokenSlice:workerTokenSlice,
    adminTokenSlice:adminTokenSlice

  }
})
export type RootState=ReturnType<typeof store.getState>;
export type AppDispatch=typeof store.dispatch

export default store
