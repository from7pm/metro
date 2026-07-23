import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosConfig from "../../configs/apiConfigs/axiosConfig";
import axios from "axios";

const arrivalInfoIndex = createAsyncThunk(
  'detailSlice/arrivalInfoIndex',
  async () => {
    const response = await axios.get(axiosConfig.API_BASE_URL, {
      params: {
        dataset: 'arrival',
        start: axiosConfig.START_INDEX,
        end: axiosConfig.END_INDEX,
      },
    });
    return response.data;
  }
);

const convenienceInfoIndex = createAsyncThunk(
  'detailSlice/convenienceIndex',
  async () => {
    const response = await axios.get(axiosConfig.API_BASE_URL, {
      params: {
        dataset: 'convenience',
        start: axiosConfig.START_INDEX,
        end: axiosConfig.END_INDEX,
      },
    });
    return response.data.TbSeoulmetroStConve.row;
  }
);

const stationInfoIndex = createAsyncThunk(
  'detailSlice/stationInfoIndex',
  async () => {
    const response = await axios.get(axiosConfig.API_BASE_URL, {
      params: {
        dataset: 'station',
        start: axiosConfig.START_INDEX,
        end: axiosConfig.END_INDEX,
      },
    });
    return response.data.StationAdresTelno.row;
  }
);

export {
  arrivalInfoIndex,
  convenienceInfoIndex,
  stationInfoIndex,
};
