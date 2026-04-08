import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
interface LocationData {
  lat: number;
  lng: number;
  city?:string
  address?: string;
  pincode?: string;
}
interface UserData {
  _id:string
  name: string;
  email: string;
  image?: string;
  location?:LocationData
}


interface UserState {
  user: UserData | null;
  location?:LocationData
}

const initialState: UserState = {
  user: JSON.parse(localStorage.getItem("userData") || "null"),
  location:JSON.parse(localStorage.getItem("location") || "null"),
};

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
      localStorage.setItem("userData", JSON.stringify(action.payload));
    },
    updateLocation: (state, action: PayloadAction<LocationData>) => {
      console.log(action.payload)
      if (state.user) {
        state.user.location = action.payload;
        localStorage.setItem("userData", JSON.stringify(state.user));
      }
        state.location=action.payload
        localStorage.setItem("location", JSON.stringify(state.location));
      
    },
    removeUser: (state) => {
      state.user = null;
      localStorage.removeItem("userData");
    },
  },
});

export const { addUser, removeUser,updateLocation } = userSlice.actions;
export default userSlice.reducer;