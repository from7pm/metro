import { useEffect, useRef, useState } from 'react';
import './SearchIndex.css';
import { useDispatch, useSelector } from 'react-redux';
import { resetCard, setArrivalStationFrCord, setArrivalStationId, setDepartureStationFrCord, setDepartureStationId, setSKind } from '../../store/slices/searchSlice.js';
import { searchIndex } from '../../store/thunks/searchThunk.js';
import { getSearchRoute } from '../../store/thunks/searchRouteThunk.js';
import { useNavigate } from 'react-router-dom';

function SearchIndex() {
  const dispatch = useDispatch();

  const departureRef = useRef(null);
  const arrivalRef = useRef(null);
  const optionsRef = useRef(null);
  
  // 검색창
  const sKind = useSelector(state => state.search.sKind); // 필터
  const allStationList = useSelector(state => state.search.list);
  const searchDepartureStationId = useSelector(state => state.search.departureStationId);
  const searchArrivalStationId = useSelector(state => state.search.arrivalStationId);
  const searchDepartureStationFrCord = useSelector(state => state.search.departureStationFrCord);
  const searchArrivalStationFrCord = useSelector(state => state.search.arrivalStationFrCord);
  const searchStatus = useSelector(state => state.search.status);
  
  // 카드 출력
  const totalTransferCnt = useSelector(state => state.search.totalTransferCnt);
  const totalStationCnt = useSelector(state => state.search.totalStationCnt);
  const totalTime = useSelector(state => state.search.totalTime);
  const resultData = useSelector(state => state.search.resultData);
  const resultSKind = useSelector(state => state.search.resultSKind);
  
  
  const [filterDropboxOpen, setFilterDropboxOpen] = useState(false); // 필터 드랍박스가 열렸는지 안 열렸는지
  const [departureInputValue, setDepartureInputValue] = useState(""); // 출발지 input에 입력된 역 명
  const [arrivalInputValue, setArrivalInputValue] = useState(""); // 도착지 input에 입력된 역 명
  const [activeField, setActiveField] = useState(null); // 출발지, 도착지 검색창 중 어떤 것이 활성화 되어있는지
  
  
  // 드롭다운 열기
  const searchOpenDropdown = (field) => {
    setActiveField(field); // 어떤 input이 활성화 되었는지
  };
  
  // 드롭다운 닫기
  function searchCloseDropdown() {
    setActiveField(null);
  }
  
  // 드롭다운 아이템 클릭 시 input에 값 넣고 드랍다운 닫기
  function handleSearchSelectStation(station) {
    if (activeField === "departure") {
      setDepartureInputValue(station.STATION_NM);
      dispatch(setDepartureStationId(station.STATION_CD));
      dispatch(setDepartureStationFrCord(station.FR_CODE));
    } else if (activeField === "arrival") {
      setArrivalInputValue(station.STATION_NM);
      dispatch(setArrivalStationId(station.STATION_CD));
      dispatch(setArrivalStationFrCord(station.FR_CODE));
    }
    searchCloseDropdown();
  }
  
  // input 클릭 시 입력값 초기화 및 드랍박스 오픈
  // 출발지
  function handleDepartureInputValuereset() {
    setDepartureInputValue('');
    dispatch(setDepartureStationId(''));
    dispatch(setDepartureStationFrCord(''));

    searchOpenDropdown("departure");
  }
  // 도착지
  function handleArrivalInputValuereset() {
    setArrivalInputValue('');
    dispatch(setArrivalStationId(''));
    dispatch(setArrivalStationFrCord(''));

    searchOpenDropdown("arrival");
  }
  
  // 드롭다운 렌더링 함수
  const renderDropdown = (stations) => {
    return stations.map(station => {
      // 중복 역 정보 가져오기
      const duplicationStation = allStationList.filter(stationItem => stationItem.STATION_NM === station.STATION_NM).length > 1;

      // LINE_NUM 화면용 포맷: "01호선" → "1호선"
      const displayLineNum = station.LINE_NUM.replace(/^0/, '');

      // 각 매칭 객체를 <li>로 반환
      return (
        <li
          key={station.STATION_CD}
          onClick={() => handleSearchSelectStation(station)}
          onMouseDown={e => e.preventDefault()}
        >
          <div className='dropdown-station-info'>
            <span>{station.STATION_NM}</span>
            <span className='dropdown-station-frcord'>{`(${station.FR_CODE})`}</span>
          </div>
          {duplicationStation && <span className="dropdown-station-line">{displayLineNum}</span>}
        </li>
      );
    });
  };

  // 역 이름 입력 시 상태 갱신
  function handleSearchInputChange(e, field) {
    if (field === "departure") {
      setDepartureInputValue(e.target.value);
    } else {
      setArrivalInputValue(e.target.value);
      searchOpenDropdown(field);
    }
  }
  
  // 입력값 기반 실시간 필터링
  const searchFilteredStations = activeField
  ? allStationList
      .filter(station => {
        const searchInputValue = activeField === "departure" ? departureInputValue : arrivalInputValue;
        return station.STATION_NM.toLowerCase().includes(searchInputValue.toLowerCase());
      })
      .filter(station => /^0[1-9]호선/.test(station.LINE_NUM)) // LINE_NUM이 1호선~9호선만 통과
      .sort(function(a, b) {
        // 역 이름 가나다순으로 정렬
        const nameCompare = a.STATION_NM.localeCompare(
          b.STATION_NM,
          "ko",
          { sensitivity: "base" }
        );
        if (nameCompare !== 0) return nameCompare;

        // 같은 역 이름끼리는 호선 기준으로 정렬
        const aLine = parseInt(a.LINE_NUM.replace(/[^0-9]/g, ""), 10);
        const bLine = parseInt(b.LINE_NUM.replace(/[^0-9]/g, ""), 10);
        return aLine - bLine;
      })
  : [];
  
  // 리버스 버튼
  function reverseBtn() {
    if(departureInputValue && arrivalInputValue) {
      // 값 임시저장
      let temporarySaveInputValue = departureInputValue;
      let temporarySaveStationId = searchDepartureStationId;
      let temporarySaveFrCord = searchDepartureStationFrCord;

      // input 뒤바꿈 처리
      setDepartureInputValue(arrivalInputValue);
      setArrivalInputValue(temporarySaveInputValue);
      // station id 뒤바꿈 처리
      dispatch(setDepartureStationId(searchArrivalStationId));
      dispatch(setArrivalStationId(temporarySaveStationId));
      // station frcord 뒤바꿈 처리
      dispatch(setDepartureStationFrCord(searchArrivalStationFrCord));
      dispatch(setArrivalStationFrCord(temporarySaveFrCord));
    }
  }
  
  // 리셋 버튼
  function resetBtn() {
    if(departureInputValue || arrivalInputValue) {
      setDepartureInputValue("");
      setArrivalInputValue("");
      dispatch(setDepartureStationId(''));
      dispatch(setArrivalStationId(''));
      dispatch(setDepartureStationFrCord(''));
      dispatch(setArrivalStationFrCord(''));
    }
    dispatch(resetCard());
  }

  // 드랍다운 표시 목록
  const searchOptions = [
    { value: '1', label: '최소 시간' },
    { value: '2', label: '최소 환승' },
    { value: '4', label: '최단 거리' },
  ];
  
  // 옵션 클릭 함수
  const handleOptionClick = (sKind) => {
    dispatch(setSKind(sKind)); // Redux의 sKind 상태 변경
    setFilterDropboxOpen(false); // 드롭다운 닫기
  };
  
  // 검색 버튼 
  const searchBtn = async () => {
    if (!searchDepartureStationId || !searchArrivalStationId) {
      alert('출발 / 도착 역을 선택해주세요.');
      return;
    }
    if (departureInputValue && departureInputValue === arrivalInputValue) {
      alert('출발역과 도착역이 동일합니다.');
      return;
    }
    dispatch(getSearchRoute());
  };
  
  // 검색 버튼 로딩 처리
  const isLoading = searchStatus === 'loading';

  const sKindLabel = (sKind) => {
    const kind = sKind;
    if (kind === '1') return '최소 시간';
    if (kind === '2') return '최소 환승';
    if (kind === '4') return '최단 거리';
  };
  
  const koreanToNumber = {
  '서해선': 'seo',
  '신림선': 'sinlim',
  '우이신설경전철': 'wooi',
  '김포도시철도': 'kimpo',
  };

  const lineToShortenName = {
    'in1': '인1',
    'in2': '인2',
    'bun': '분당',
    'sinbun': '신분',
    'kyung': '경의',
    'kong': '공항',
    'chun': '경춘',
    'yongin': '용인',
    'kyeongkang': '경강',
    '서해선': '서해',
    '김포도시철도': '김포',
    '신림선': '신림',
    '의정부경전철': '의정부',
    '우이신설경전철': '우이',
  }

  function lineName(line) {
    const changedName = lineToShortenName[line];
    if(changedName) {
      return changedName;
    } else {
      return line;
    }
  }

  function fontSizeChange(changedName) {
    if(changedName.length === 2) {
      return 'line-name-two-letter';
    } else if(changedName.lentgh === 3) {
      return 'line-name-three-letter';
    }
  }

  function lineColor(line) {
    const koreanCode = koreanToNumber[line];
    if(koreanCode) {
      return `line-${koreanCode}`;
    } else {
    return `line-${line}`;
    }
  }

  const navigate = useNavigate();

  const handleStationClick = (line, stationName) => {
    const lineId = 'line' + line
    navigate(`/linesdetail/${lineId}/details/${stationName}`);
  }

  const allowedLines = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    dispatch(searchIndex());

    function handleSearchClickOutside(event) {
      const clickOutsideInput = departureRef.current && !departureRef.current.contains(event.target) && arrivalRef.current && !arrivalRef.current.contains(event.target);

      const clickOutsideOptions = optionsRef.current && !optionsRef.current.contains(event.target)
      
      if (clickOutsideInput && clickOutsideOptions) {
        searchCloseDropdown();
      }
      if (clickOutsideOptions) {
        setFilterDropboxOpen(false);
      }
    }
    document.addEventListener("mousedown", handleSearchClickOutside);

    return () => document.removeEventListener("mousedown", handleSearchClickOutside);
  }, []);

  return (
    <>
      <div className="search-container">
        <div className="search-option-container" ref={optionsRef}>
          <button type="button" className='search-kind'
            onClick={() => setFilterDropboxOpen(!filterDropboxOpen)}
          >
            <span className={`dropdown-option-arrow ${filterDropboxOpen ? 'open' : ''}`}>▼</span>{sKindLabel(sKind)}
          </button>
          {filterDropboxOpen && (
            <ul className="option-list">
            {searchOptions.map((option) => (
              <li
              key={option.value}
              className="option-dropdown-item"
              onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
        </div>
        <div className='search-box'>
          <div className='search-departure-station' ref={departureRef}>
            <input className='departure-station'
              value={departureInputValue}
              onChange={e => handleSearchInputChange(e, "departure")}
              onFocus={() => searchOpenDropdown("departure")}
              onClick={handleDepartureInputValuereset}
              autoComplete='off' // 브라우저 기본 자동완성 기능 끄기
              type="text" placeholder='출발지'
            />
            {activeField === "departure" && (searchFilteredStations.length > 0 ? (
              <ul className="search-dropdown">
                {renderDropdown(searchFilteredStations)}
              </ul>
              ) : (
                <ul className="search-dropdown">
                  <li className="no-result">일치하는 역이 없습니다.</li>
                </ul>
              )
            )}
          </div>
          <button className='reverse-btn' onClick={reverseBtn} type="button">
            <img src="/btn/reverse-btn.svg" alt="출발지와 도착지 교환 기능" />
          </button>
          <div className='search-arrival-station' ref={arrivalRef}>
            <input className='arrival-station'
              value={arrivalInputValue}
              onChange={e => handleSearchInputChange(e, "arrival")}
              onFocus={() => searchOpenDropdown("arrival")}
              onClick={handleArrivalInputValuereset}
              autoComplete='off' // 브라우저 기본 자동완성 기능 끄기
              type="text" placeholder='도착지'
            />
            {activeField === "arrival" && (searchFilteredStations.length > 0 ? (
              <ul className="search-dropdown">
                {renderDropdown(searchFilteredStations)}
              </ul>
              ) : (
                <ul className="search-dropdown">
                  <li className="no-result">일치하는 역이 없습니다.</li>
                </ul>
              )
            )}
          </div>
          <div className='search-btns'>
            <button className='reset-btn' onClick={resetBtn} type="button">리셋</button>
            <button className='search-btn' type="button" onClick={searchBtn} disabled={isLoading}>
              {isLoading ? '검색 중...' : '길찾기'}
            </button>
          </div>
        </div>
            {
            resultData.length > 0 && (
            <div className='search-card-container'>
              <div className="card">
                <div className='card-take-group'>
                  <p className='card-running-time'>{totalTime}</p>
                  <p className='card-content-group'>{sKindLabel(resultSKind)}</p>
                </div>
                <p className='card-process'>{totalStationCnt}개역 환승 {totalTransferCnt}회</p>
                <div className="card-route-container">
                  {
                    resultData.length > 0 && resultData.map((item, idx) => {
                      return (
                        <>
                          <div className='route-group' key={`${item.transferStationLine}${item.transferStationName}${idx}`}>
                            <p className='estimated-time'>{item.transferStationTime}</p>
                            <div className='route-map'>
                              <div className={`search-circle ${lineColor(item.transferStationLine)}`}></div>
                              <div className={`search-line ${lineColor(item.transferStationLine)}`}></div>
                            </div>
                            <div className='apply-station' onClick={
                              allowedLines.includes(item.transferStationLine)
                              ? () => handleStationClick(item.transferStationLine, item.transferStationName)
                            : null} style={{cursor: allowedLines.includes(item.transferStationLine) ? 'pointer' : 'default'}}>
                              <p className={`search-line-number ${lineColor(item.transferStationLine)} ${fontSizeChange(lineName(item.transferStationLine))}`}>{lineName(item.transferStationLine)}</p>
                              <p className='station-name'>{item.transferStationName}</p>
                            </div>
                          </div>
                        </>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          )
        }
      </div>
    </>
  )
}

export default SearchIndex;