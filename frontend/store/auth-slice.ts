import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { getAuthStatus, type AuthStatus, type MeResponse } from "@/features/auth/types";

interface AuthState {
  status: AuthStatus;
  user: MeResponse | null;
}

const initialState: AuthState = {
  status: "unknown",
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticatedUser(state, action: PayloadAction<MeResponse>) {
      state.user = action.payload;
      state.status = getAuthStatus(action.payload);
    },
    setGuest(state) {
      state.user = null;
      state.status = "guest";
    },
    setAuthUnknown(state) {
      state.status = "unknown";
    },
  },
});

export const { setAuthenticatedUser, setGuest, setAuthUnknown } = authSlice.actions;
export default authSlice.reducer;
