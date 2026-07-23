import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosConfig from "../../configs/apiConfigs/axiosConfig.js";
import axios from "axios";

const evacuationIndex = createAsyncThunk(
  'evacuationSlice/evacuationIndex',
  async () => {
    const response = await axios.get(axiosConfig.API_BASE_URL, {
      params: {
        dataset: 'evacuation',
        start: axiosConfig.START_INDEX,
        end: axiosConfig.END_INDEX,
      },
    });

    return response.data.SmrtEmergerncyGuideImg.row;
  }
);

export { evacuationIndex };
