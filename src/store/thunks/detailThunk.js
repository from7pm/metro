import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosConfig from "../../configs/apiConfigs/axiosConfig";
import axios from "axios";

const arrivalInfoIndex = createAsyncThunk(
  'detailSlice/arrivalInfoIndex',
  async () => {
    const url = `${axiosConfig.DETAIL_BASE_URL}/${axiosConfig.KEY}/${axiosConfig.TYPE}/${axiosConfig.ARRIVAL_INFO_SERVICE}/${axiosConfig.START_INDEX}/${axiosConfig.END_INDEX}`;

    const response = await axios.get(url);
    return response.data;
  }
);

const convenienceInfoIndex = createAsyncThunk(
  'detailSlice/convenienceIndex',
  async () => {
    const url = `${axiosConfig.SEARCH_EVACUATION_BASE_URL}/${axiosConfig.KEY}/${axiosConfig.TYPE}/${axiosConfig.CONVENIENCE_SERVICE}/${axiosConfig.START_INDEX}/${axiosConfig.END_INDEX}`;

    const response = await axios.get(url);
    return response.data.TbSeoulmetroStConve.row;
  }
);

const stationInfoIndex = createAsyncThunk(
  'detailSlice/stationInfoIndex',
  async () => {
    const url = `${axiosConfig.SEARCH_EVACUATION_BASE_URL}/${axiosConfig.KEY}/${axiosConfig.TYPE}/${axiosConfig.STATION_INFO_SERVICE}/${axiosConfig.START_INDEX}/${axiosConfig.END_INDEX}`;

    const response = await axios.get(url);
    return response.data.StationAdresTelno.row;
  }
);

export {
  arrivalInfoIndex,
  convenienceInfoIndex,
  stationInfoIndex,
};