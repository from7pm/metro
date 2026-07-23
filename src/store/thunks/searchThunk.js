import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosConfig from "../../configs/apiConfigs/axiosConfig";

const searchIndex = createAsyncThunk(
  'searchSlice/searchIndex',
  async () => {
    const response = await axios.get(axiosConfig.API_BASE_URL, {
      params: {
        dataset: 'search',
        start: axiosConfig.START_INDEX,
        end: axiosConfig.END_INDEX,
      },
    });

    return response.data.SearchInfoBySubwayNameService.row;
  }
);

export { searchIndex };
