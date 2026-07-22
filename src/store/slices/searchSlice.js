import { createSlice } from "@reduxjs/toolkit";
import { searchIndex } from "../thunks/searchThunk.js";
import { getSearchRoute } from "../thunks/searchRouteThunk.js";
import { parseXMLResponse } from "../../components/utils/xmlMetroParser.js";
import dayjs from 'dayjs';

const searchSlice = createSlice({
  name: 'searchSlice',
  initialState: {
    list: [],
    departureStationId: '',
    arrivalStationId: '',
    departureStationFrCord: '',
    arrivalStationFrCord: '',
    sKind: '1', // 경로 탐색 기준
    resultSKind: '1',

    loading: 'idle', // 로딩

    // 길찾기 출력 스테이트
    totalTransferCnt: 0,
    totalStationCnt: 0,
    totalTime: '0',
    endStationName: '',
    resultData: [],
  },
  reducers: {
    setDepartureStationId: (state, action) => {
      state.departureStationId = action.payload;
    },
    setArrivalStationId: (state, action) => {
      state.arrivalStationId = action.payload;
    },
    setDepartureStationFrCord: (state, action) => {
      state.departureStationFrCord = action.payload;
    },
    setArrivalStationFrCord: (state, action) => {
      state.arrivalStationFrCord = action.payload;
    },
    setSKind: (state, action) => {
      state.sKind = action.payload;
    },
    resetCard: (state) => {
      state.resultData = [];
      state.status = 'idle';
      state.sKind = '1';
      state.committedSKind = '1';
    },
  },
  extraReducers: builder => {
    builder
      .addCase(searchIndex.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(getSearchRoute.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getSearchRoute.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.resultSKind = state.sKind;
        const parsedXMLResponse = parseXMLResponse(action.payload?.rawXML);

        // 변수 선언
        let totalStationCnt = 0;
        let totalTransferCnt = parsedXMLResponse.transferList.length;
        let transferStationName = '';
        let transferStationLine = '';
        let transferStationTime = null;
        let totalTime = dayjs();
        const result = [];

        function formatMinuteToHour(stringMinutes) {
          const minutes = parseInt(stringMinutes, 10)
          const hours = Math.floor(minutes / 60);
          const remain = minutes % 60;

          if(hours > 0 && remain > 0) {
            return `${hours}시간 ${remain}분`;
          } else if(hours > 0 && remain === 0) {
            return `${hours}시간`;
          } else {
            return `${remain}분`;
          }
        }
        
        let loopCnt = 0;
        const pathListLength = parsedXMLResponse.pathList.length;
        for (const item of parsedXMLResponse.pathList) {
          loopCnt++;

          if(!transferStationName) {
            transferStationName = item.startStation;
            transferStationLine = item.line;
            transferStationTime = totalTime.clone();
          }
        
          // 환승역인지 확인
          if(item.runTime) {
            totalStationCnt++;
            const [minute, second] = item.runTime.split(':');
            totalTime = totalTime.add(parseInt(minute), 'minute').add(parseInt(second), 'second');
          } else {
            // result 만들기
            result.push({
              transferStationName,
              transferStationLine,
              transferStationTime: transferStationTime.format('HH:mm'),
            });
        
            // 아이템 추가 후 초기화
            transferStationName = '';
            transferStationLine = '';
            transferStationTime = null;
          }

          // 가장 마지막 루프일 때 처리
          if(loopCnt >= pathListLength) {
            // 마지막 환승역 result 추가
            result.push({
              transferStationName,
              transferStationLine,
              transferStationTime: transferStationTime.format('HH:mm'),
            });

            // 도착역 result 추가
            result.push({
              transferStationName: item.endStation,
              transferStationLine: item.line,
              transferStationTime: totalTime.format('HH:mm'),
            });
          }
        }
        
        // 스테이트에 저장
        state.totalTransferCnt = totalTransferCnt;
        state.totalStationCnt = totalStationCnt;
        state.totalTime = formatMinuteToHour(parsedXMLResponse.totalTime);
        state.endStationName = parsedXMLResponse.endStation;
        state.resultData = result;
      })
      .addMatcher(
        action => action.type.startsWith('searchSlice/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          console.error('searchSlice Error', action.payload, action.error);
        }
      )
    }
})

export const {
  setDepartureStationId,
  setDepartureStationFrCord,
  setArrivalStationId,
  setArrivalStationFrCord,
  setSKind,
  resetCard,
} = searchSlice.actions;

export default searchSlice.reducer;