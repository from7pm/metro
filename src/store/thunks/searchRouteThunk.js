import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const getSearchRoute = createAsyncThunk(
  'searchSlice/getSearchRoute',
  async (arg, thunkAPI) => {
    try {
      const state = thunkAPI.getState().search;
      console.log(state);

      const formData = new FormData()
      formData.append('departureId', state.departureStationId) // 출발역 ID
      formData.append('arrivalId', state.arrivalStationId) // 도착역 ID
      formData.append('sKind', state.sKind) // 검색 종류 1 = 최소 시간 4 = 최단 거리 2= 최소 환승

      const response = await axios.post('/api/kr/getRouteSearchResult.do',
        formData,
        {
          responseType: 'text',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Accept': 'application/xml, text/xml, */*; q=0.01',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      if (!response.data) {
        // thunkAPI.rejectWithValue를 사용하여 에러 처리
        return thunkAPI.rejectWithValue('경로 정보를 찾을 수 없습니다. 역명을 다시 확인해주세요.');
      }
      // 그대로 XML 문자열을 반환
      return {
        rawXML: response.data,
        meta: { // 사용자가 검색했을 때 어떤 요청인지를 구분하기 위함
          sKind: state.sKind,
          startStation: state.departureStation,
          endStation: state.arrivalStation,
        }
      };
    } catch (err) {
      // 오류 메시지 정제
      const message = `${err.message} : 지하철 경로 조회 중 오류가 발생했습니다.`;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export { getSearchRoute }