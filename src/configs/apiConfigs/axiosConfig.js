const axiosConfig = {
  SEARCH_EVACUATION_BASE_URL: 'https://app11.green-meerkat.kro.kr/openAPI',
  DETAIL_BASE_URL: 'https://app11.green-meerkat.kro.kr/swopenAPI/api/subway',
  KEY: '6147526d5a716f7734374451505377',
  TYPE: 'json',
  EVACUATION_SERVICE: 'SmrtEmergerncyGuideImg',
  ARRIVAL_INFO_SERVICE: 'realtimeStationArrival/ALL',
  CONVENIENCE_SERVICE: 'TbSeoulmetroStConve', // EVACUATION_BASE_URL 사용
  STATION_INFO_SERVICE: 'StationAdresTelno', // EVACUATION_BASE_URL 사용
  SEARCH_SERVICE: 'SearchInfoBySubwayNameService',
  START_INDEX: 1,
  END_INDEX: 850,
}

export default axiosConfig;