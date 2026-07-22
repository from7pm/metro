import { createSlice } from "@reduxjs/toolkit";
import { evacuationIndex } from "../thunks/evacuationThunk.js";

const evacuationSlice = createSlice({
  name: 'evacuationSlice',
  initialState: {
    list: [],
  },
  reducers: {

  },
  extraReducers: builder => {
    builder
      .addCase(evacuationIndex.fulfilled, (state, action) => {
        state.list = action.payload;
      });
  }
})

export default evacuationSlice.reducer;