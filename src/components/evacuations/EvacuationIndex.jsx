import './EvacuationIndex.css';
import { line1List } from '../../configs/line-list-configs/line1ListConfig.js';
import { line2List } from '../../configs/line-list-configs/detail-line-list-configs/line2ListConfig.js';
import { line3List } from '../../configs/line-list-configs/line3ListConfig.js';
import { line4List } from '../../configs/line-list-configs/line4ListConfig.js';
import { line5List } from '../../configs/line-list-configs/line5ListConfig.js';
import { line6List } from '../../configs/line-list-configs/line6ListConfig.js';
import { line7List } from '../../configs/line-list-configs/line7ListConfig.js';
import { line8List } from '../../configs/line-list-configs/line8ListConfig.js';
import { line9List } from '../../configs/line-list-configs/line9ListConfig.js';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { evacuationIndex } from '../../store/thunks/evacuationThunk.js';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

const lineMap = {
  "line-1": line1List,
  "line-2": line2List,
  "line-3": line3List,
  "line-4": line4List,
  "line-5": line5List,
  "line-6": line6List,
  "line-7": line7List,
  "line-8": line8List,
  "line-9": line9List,
}

// 호선 목록
// value 내부 식별용 키 / label UI 표시 용
const lineOptions = [
  { value: "line-1", label: "1호선" },
  { value: "line-2", label: "2호선" },
  { value: "line-3", label: "3호선" },
  { value: "line-4", label: "4호선" },
  { value: "line-5", label: "5호선" },
  { value: "line-6", label: "6호선" },
  { value: "line-7", label: "7호선" },
  { value: "line-8", label: "8호선" },
  { value: "line-9", label: "9호선" },
];

function EvacuationIndex() {
  const dispatch = useDispatch();

  const evacuationSearchList = useSelector(state => state.evacuation.list);

  const [selectedLine, setSelectedLine] = useState(""); // 선택된 호선
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false); // 호선의 선택창의 드랍다운이 열렸는지 안 열렸는지
  const [inputValue, setInputValue] = useState(""); // input에 입력된 역 명
  const [stationDropdownOpen, setStationDropdownOpen] = useState(false); // 역 검색창을 눌렀는지 안 눌렀는지
  const [tooltipVisible, setTooltipVisible] = useState(false); // 툴팁 출력
  const [isLoaded, setIsLoaded] = useState(false); // 이미지가 로드 됐는지 안 됐는지
  const [matchedItem, setMatchedItem] = useState([]); // inputValue와 api의 역 명이 같은 아이템 하나
  const [isSearched, setIsSearched] = useState(false); // 검색 여부 저장

  const evacuationLineSearchRef = useRef(null);
  const evacuationStationSearchRef = useRef(null);

  // 선택된 호선의 역 배열 가져오기
  const stations = lineMap[selectedLine] || [];
  
  // 호선 드롭다운 토글
  function toggleLineDropdown() {
    setLineDropdownOpen(prev => !prev);
  }

  // 호선 선택
  function handleSelectLine(lineValue) {
    setSelectedLine(lineValue);
    setLineDropdownOpen(false);
    // 호선 변경 시 state 초기화
    setInputValue("");
    setMatchedItem([]);
    setIsLoaded(false);
    setIsSearched(false);
  }

  // 툴팁 출력
  function handleInputFocus() {
    if (!stations.length) {
      setTooltipVisible(true);
    } else {
      setStationDropdownOpen(true);
    }
  }
  
  // input 클릭 시 state 초기화
  function handleInputValueChange() {
    if(inputValue !== '') {
      setInputValue('');
      setMatchedItem([]);
      setIsLoaded(false);
      setIsSearched(false);
    }
    setStationDropdownOpen(true);
  }
  
  // 역 검색 드롭다운 아이템 클릭 시 input에 값 넣고 드랍다운 닫기
  function handleSelectStation(station) {
    setInputValue(station);
    setStationDropdownOpen(false);
  }

  // 역 이름 입력 시 상태 갱신
  function handleInputChange(e) {
    setInputValue(e.target.value);
    setStationDropdownOpen(true);
  }
  
  // 입력값 기반 실시간 필터링
  const filteredStations = inputValue.trim() === "" ? stations : stations.filter((station) => station.includes(inputValue));
  
  // 선택된 역 이름과 같은 항목 찾기
function searchStation() {
  setIsSearched(true);
  const foundMatchedStation = evacuationSearchList.find((item) => item.STTN === `${inputValue}역`) || null;
  setMatchedItem(foundMatchedStation);
  if (foundMatchedStation) {
    setIsLoaded(false);
  }
}
  
  // onKeyDown 이벤트
  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      searchStation();
    }
  }
  
  // 이미지가 로딩됐을 때 state 상태 변경
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // API 호출 & 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    dispatch(evacuationIndex());

    function handleClickOutside(event) {
      if (evacuationLineSearchRef.current && !evacuationLineSearchRef.current.contains(event.target)) {
        setLineDropdownOpen(false);
      }
      if (evacuationStationSearchRef.current && !evacuationStationSearchRef.current.contains(event.target)) {
        setStationDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <>
      <div className="evacuation-container">
        <div className='evacuation-search-box'>
          <div className='line-search' ref={evacuationLineSearchRef}>
            <label htmlFor="line-select">호선</label>
            <div className='line-dropdown-container' onClick={toggleLineDropdown}>
              <input
                id='line-select'
                className='evacuation-input'
                readOnly
                value={selectedLine ? lineOptions.find(option => option.value === selectedLine).label : "호선을 선택하세요."}
                type="text"
              />
              <span className={`dropdown-btn ${lineDropdownOpen ? 'evacuation-line-search-open' : ''}`}></span>
              {lineDropdownOpen && (
                <ul className='evacuation-dropdown'>
                  {lineOptions.map(option => (
                    <li key={option.value} onClick={(e) => {
                      e.stopPropagation(); // 버블링(이벤트가 부모로 전파되는 현상) 방지
                      handleSelectLine(option.value)}}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className='station-search' ref={evacuationStationSearchRef}>
            <label htmlFor="station-search-input">역 명</label>
            <div className='station-dropdown-container'>
              <input className='evacuation-input'
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={() => setTooltipVisible(false)}
                onKeyDown={handleEnter}
                onClick={handleInputValueChange}
                autoComplete="off" // 브라우저 기본 자동완성 기능 끄기
                type="text" id='station-search-input' placeholder='조회하실 역 명을 입력해주세요.'
              />
              <button className='station-search-btn' onClick={searchStation}></button>
              {tooltipVisible && !selectedLine && (
                <div className="tooltip">
                  <p>호선을 선택해주세요.</p>
                </div>
              )}
              {stationDropdownOpen && selectedLine && (filteredStations.length > 0 ? (
                <ul className="evacuation-dropdown">
                  {filteredStations.map((station) => (
                    <li
                      key={station}
                      onClick={() => handleSelectStation(station)}
                      onMouseDown={(e) => e.preventDefault()} // input 포커스 유지
                    >
                      {station}
                    </li>
                  ))}
                </ul>
                ) : (
                  <ul className="evacuation-dropdown">
                    <li>일치하는 역이 없습니다.</li>
                  </ul>
                )
              )}
            </div>
          </div>
        </div>
        <div className={`img-card ${isLoaded ? '' : 'img-card-center'}`}>
          {!isSearched ? (
            <p className='evacuation-img-placeholder'>역을 선택할 시 이곳에 대피도가 표시됩니다.</p>
          ) : matchedItem?.IMG_LINK ? (
            <TransformWrapper>
              <TransformComponent
                initialScale={1}
                minScale={1}
                maxScale={4}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ disabled: false }}
                pan={{ velocity: true }}
              >
                <img className='evacuation-img' src={matchedItem.IMG_LINK} alt={`${inputValue} 대피도`} onLoad={handleImageLoad} />
              </TransformComponent>
            </TransformWrapper>
          ) : (
            <p className='evacuation-img-placeholder'>해당 역의 대피도가 없습니다.</p>
          )}
          <img className='expansion-icon' src="/icons/expansion-icon.svg" alt="확대, 축소 및 드래그가 가능하다는 것을 나타내는 아이콘" />
        </div>
      </div>
    </>
  )
}

export default EvacuationIndex;