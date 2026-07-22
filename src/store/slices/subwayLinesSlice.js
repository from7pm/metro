import { createSlice } from "@reduxjs/toolkit";
import { ROUTE_DISPLAY } from "../../configs/line-list-configs/subwayLinesRouteConfig.js";

const initialList = Array.isArray(ROUTE_DISPLAY) ? ROUTE_DISPLAY : [];

const subwayLinesSlice = createSlice({
  name: "subwayLines",
  initialState: {
    list: initialList,
  },
  reducers: {
    // 필요 시 정적 데이터 덮어쓰기용으로만 유지
    setSeoulLines: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.list = action.payload;
      }
    },
    clearSeoulLines: (state) => {
      state.list = [];
    },
  },
});

export const { setSeoulLines, clearSeoulLines } = subwayLinesSlice.actions;
export default subwayLinesSlice.reducer;

// 셀렉터
export const selectSeoulLines = (s) => s.lines.list;