import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import axiosConfig from "../../configs/apiConfigs/axiosConfig";

const searchIndex = createAsyncThunk(
  'searchSlice/searchIndex',
  async () => {
    const url = `${axiosConfig.SEARCH_EVACUATION_BASE_URL}/${axiosConfig.KEY}/${axiosConfig.TYPE}/${axiosConfig.SEARCH_SERVICE}/${axiosConfig.START_INDEX}/${axiosConfig.END_INDEX}`;

    const response = await axios.get(url);

    return response.data.SearchInfoBySubwayNameService.row;
  }
);

export { searchIndex };