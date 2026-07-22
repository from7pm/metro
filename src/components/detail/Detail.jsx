import { useDispatch, useSelector } from 'react-redux';
import './Detail.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { arrivalInfoIndex, convenienceInfoIndex, stationInfoIndex } from '../../store/thunks/detailThunk';
import LINE_COLORS from "../../configs/lineColors.js";

function Detail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lineId, station } = useParams();

  const [ refreshing, setRefreshing ] = useState(false);

  const lines = useSelector((state) => state.detail.lines);
  const stationInfo = useSelector((state) => state.detail.stationInfo);
  const convenienceInfo = useSelector((state) => state.detail.convenienceInfo);
  const arrivalInfo = useSelector((state) => state.detail.arrivalInfo);
  
  // lineId의 숫자만 가져와서 비교
  const lineNumOnly = lineId.replace('line', '');
  const matchesLineField = (fieldValue) => {
    if (!fieldValue) return false;
    const normalized = String(fieldValue);
    return normalized.includes(lineNumOnly) || normalized.includes(`${lineNumOnly}호`) || normalized.includes(`${lineNumOnly}호선`);
  };

  // 윤희님 작업 : 호선별 색상 변경
  const lineNum = lineId.replace('line', '') + '호선';
  const lineColor = useMemo(
  () => LINE_COLORS[lineNum] ?? "#000000",
  [lineNum]
  );



  
  // ---------- 도착 정보 ----------

  const stationNameMapping = {
    line1: {
      "쌍용": "쌍용(나사렛대)"
    },
    line4: {
      "이수": "총신대입구(이수)"
    },
    line5: {
      "신정": "신정(은행정)",
      "오목교": "오목교(목동운동장앞)",
      "군자": "군자(능동)",
      "아차산": "아차산(어린이대공원후문)",
      "광나루": "광나루(장신대)",
      "천호": "천호(풍납토성)",
      "굽은다리": "굽은다리(강동구민회관앞)",
      "올림픽공원": "올림픽공원(한국체대)"
    },
    line6: {
      "응암": "응암순환(상선)",
      "새절": "새절(신사)",
      "증산": "증산(명지대앞)",
      "월드컵경기장": "월드컵경기장(성산)",
      "대흥": "대흥(서강대앞)",
      "안암": "안암(고대병원앞)",
      "월곡": "월곡(동덕여대)",
      "상월곡": "상월곡(한국과학기술연구원)",
      "화랑대": "화랑대(서울여대입구)"
    },
    line7: {
      "공릉": "공릉(서울산업대입구)",
      "군자": "군자(능동)",
      "어린이대공원": "어린이대공원(세종대)",
      "이수": "총신대입구(이수)",
      "숭실대입구": "숭실대입구(살피재)",
      "상도": "상도(중앙대앞)"
    },
    line8: {
      "천호": "천호(풍납토성)",
      "몽촌토성": "몽촌토성(평화의문)",
      "남한산성입구": "남한산성입구(성남법원,검찰청)"
    }
  };

  useEffect(() => {
    dispatch(arrivalInfoIndex());
  }, []);

  // 새로고침 버튼 클릭 시 실행
  const handleRefresh = async() => {
    setRefreshing(true);
    await dispatch(arrivalInfoIndex()); // 최신 도착 정보 다시 불러오기
    setTimeout(() => setRefreshing(false), 800); // 로딩 표시 잠깐 유지
  };

  // 현재역의 도착 정보(역명(statnNm)과 호선이 동일한 것만 가져오기)
  const currentArrivalList = Array.isArray(arrivalInfo) ? arrivalInfo.filter((info) => {
  // 역명이 같으면
    if (info.statnNm === station) {
      const sameStation = info.statnNm === station; // 현재역명
      const subwayIdNum = Number(info.subwayId); // 문자열 숫자로 변환
      const validSubwayId = subwayIdNum >= 1001 && subwayIdNum <= 1009; // 1001~1009만 가져옴
      const sameLine = subwayIdNum % 100 === Number(lineNumOnly);

      return sameStation && validSubwayId && sameLine; // 동일한 호선 및 유효한 subwayId일 때만 반환
    } else {
      // 역명이 다르면 stationNameMapping을 기준으로 비교
      const mappedStation = stationNameMapping[lineId]?.[station]; // stationNameMapping에서 역명 비교
      if (mappedStation && mappedStation === info.statnNm) {
        const subwayIdNum = Number(info.subwayId); // 문자열 숫자로 변환
        const validSubwayId = subwayIdNum >= 1001 && subwayIdNum <= 1009; // 1001~1009만 가져옴
        const sameLine = subwayIdNum % 100 === Number(lineNumOnly);

        return validSubwayId && sameLine; // 동일한 호선 및 유효한 subwayId일 때만 반환
      }
      return false; // station과 statnNm이 다르면 아무것도 반환하지 않음
    }
  }) : [];

  // trainLineNm에서 '행' 앞부분 제거하고, '~방면'만 추출
  const extractDirection = (trainLineNm) => {
    if (!trainLineNm) return "";
    // 예: '개화행 - 선유도방면' -> '선유도방면'
    // ('-'을 없애고 공백을 제거함 -> ["~행", "~방면"] 중 1("~방면")만 가져옴) 
    const parts = trainLineNm.split("-").map(p => p.trim());
    return parts.length > 1 ? parts[1] : trainLineNm;
  };

  // 방면별로 그룹화
  const groupedByDirection = currentArrivalList.reduce((acc, cur) => {
    const direction = extractDirection(cur.trainLineNm);
    if (!acc[direction]) acc[direction] = [];
    acc[direction].push(cur);
    return acc;
  }, {});

  // 각 방면에서 barvlDt 오름차순으로 정렬 후 2개까지만 남기기
  Object.keys(groupedByDirection).forEach(direction => {
    groupedByDirection[direction] = groupedByDirection[direction]
      .sort((a, b) => a.barvlDt - b.barvlDt)
      .slice(0, 2);
  });

  // barvlDt의 초 단위를 '분'으로 변환
  const formatSecondsToMinutes = (sec) => {
    const num = Number(sec);
    if (isNaN(num) || num < 0) return "-";
    if (num < 60) return "곧 도착";
    return `${Math.floor(num / 60)}분`;
  };



  // ---------- 편의시설 ----------

  useEffect(() => {
    dispatch(convenienceInfoIndex());
  }, []);

  const currentConvenienceInfo = Array.isArray(convenienceInfo) ? convenienceInfo.find(info =>
    info.STATION_NAME === station && (matchesLineField(info.LINE) || matchesLineField(info.LINE?.toString?.()))) || convenienceInfo.find(info => info.STATION_NAME === station) : null;

  const getConvenienceInfo = (key) => {
    const value = currentConvenienceInfo?.[key];
    const convenienceAvailable = value === 'Y';

    const convenienceIconName = {
      EL: "elevator",
      WL: "wheelchairlift",
      PARKING: "parking",
      BICYCLE: "bicycleshed",
      FDROOM: "nursingroom",
    };

    const iconName = convenienceIconName[key];
    const iconSrc = convenienceAvailable ? `/icons/${iconName}-icon-y.svg` : `/icons/${iconName}-icon-n.svg`;
    const textColor = convenienceAvailable ? "black" : "gray";

    return { iconSrc, textColor };
  };



  // ---------- 역 정보 ----------

  useEffect(() => {
    dispatch(stationInfoIndex());
  }, []);

  const currentStationInfo = Array.isArray(stationInfo)
    ? stationInfo.find(info =>
        info.SBWY_STNS_NM.includes(station) && (
          matchesLineField(info.SBWY_ROUT_LN) || matchesLineField(info.SBWY_ROUT_LN?.toString?.())
        )
      ) 
    : null;



  // ---------- 이전역/현재역/다음역 ----------
  
  // 현재 line의 현재역(station)이 포함된 리스트 찾기
  const targetLineKey = `${lineId}List`; // ex)line1 -> line1List로 만들기
  let stationList = lines && lines[targetLineKey] ? lines[targetLineKey] : undefined;
  if (!stationList) {
    const foundLineEntry = Object.entries(lines).find(([, list]) => Array.isArray(list) && list.includes(station));
    stationList = foundLineEntry ? foundLineEntry[1] : undefined;
  }
  if (!stationList) {
    return <p> ⚠️ "{station}" 역을 찾을 수 없습니다. </p>
  }

  // 현재역의 index, 이전/다음역 찾기
  const currentIndex = stationList.indexOf(station);
  const prevStation = currentIndex > 0 ? stationList[currentIndex - 1] : null;
  const nextStation = currentIndex < stationList.length - 1 ? stationList[currentIndex + 1] : null;

  // 노선 번호 표시용 특수문자
  // TODO : 시간되면 특수문자 말고 div로 자동설정되기 수정
  const lineSymbolMapbyId = {
    line1List: "➊",
    line2List: "➋",
    line3List: "➌",
    line4List: "➍",
    line5List: "➎",
    line6List: "➏",
    line7List: "➐",
    line8List: "➑",
    line9List: "➒",
  }
  
  const lineSymbol = lineSymbolMapbyId[targetLineKey] || ""; // 객체에서 특정 키에 해당하는 값을 꺼내는 문법

  // 현재역의 이전/다음으로 이동
  const MovePrevStation = () => {
    if(prevStation) navigate(`/linesdetail/${lineId}/details/${prevStation}`);
  }
  const MoveNextStation = () => {
    if(nextStation) navigate(`/linesdetail/${lineId}/details/${nextStation}`);
  }



  return (
    <>
      <div className="detail-container" style={{ "--line-color": lineColor }}>

        {/* 이전역-다음역 표시 */}
        <div className='next-station-container' >
          {/* <div className="prev-station left"><p>〈 종각</p></div> */}
          {/* <div className="next-station right"><p>서울역 〉</p></div> */}
          <div className={`prev-station ${!prevStation ? "disabled" : ""}`} onClick={prevStation ? MovePrevStation : undefined} style={{cursor: prevStation ? 'pointer' : 'default'}} >
            {/* <p>〈 {prevStation || ""}</p> */}
            <span className='prev-station-arrow' >〈</span>
            <span className='prev-station-name' >{prevStation || ""}</span>
          </div>
          <div className={`next-station ${!nextStation ? "disabled" : ""}`} onClick={nextStation ? MoveNextStation : undefined} style={{cursor: nextStation ? 'pointer' : 'default'}} >
            <span className='next-station-name' >{nextStation || ""}</span>
            <span className='next-station-arrow' >〉</span>
          </div>
        </div>
        {/* 현재역 표시 */}
        <div className="now-station">
          <span className='line-num' >{lineSymbol}</span>
          <span className={`now-station-name ${station.length > 5 ? (station.length > 7 ? "longer" : "long") : ""}`} >{station}</span>
        </div>

        {/* 도착정보 */}
        <div>
          <div className="arrival-title">
            <p>도착 정보</p>
            {/* <button type="button" className='refresh-btn' onClick={handleRefresh} >🔄</button> */}
            <img className={`refresh-btn ${refreshing ? "rotating" : ""}`} onClick={handleRefresh} src={`/icons/refresh-icon-2.svg`} alt="새로고침" />
          </div>
          <div className="arrival-container">
            {Object.keys(groupedByDirection).length > 0 ? (
              Object.entries(groupedByDirection).map(([direction, trains]) => (
                <div key={direction}>
                  <div className={`arrival-direction ${direction.length > 17 ? "long" : ""}`}>
                    <p>{direction}</p>
                  </div>
                  <div className="arrival-info">
                    {trains.map((train, idx) => (
                      <div key={idx} className={`arrival-info-${idx + 1}`}>
                        <span>{train.bstatnNm}</span>
                        <span>{formatSecondsToMinutes(train.barvlDt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", color: "gray" }}>도착 정보 없음</p>
            )}
          </div>
        </div>
        
        {/* 편의시설 유무 */}
        <div>
          <div className="convenience-title">
            <p>편의시설</p>
          </div>
          <div className="convenience-container">
            <div className="convenience-info">
              <img src={getConvenienceInfo("EL").iconSrc} alt="엘리베이터" />
              <p style={{color: getConvenienceInfo("EL").textColor}}>엘리베이터</p>
            </div>
            <div className="convenience-info">
              <img src={getConvenienceInfo("FDROOM").iconSrc} alt="수유실" />
              <p style={{color: getConvenienceInfo("FDROOM").textColor}}>수유실</p>
            </div>
            <div className="convenience-info">
              <img src={getConvenienceInfo("PARKING").iconSrc} alt="환승주차장" />
              <p style={{color: getConvenienceInfo("PARKING").textColor}}>환승주차장</p>
            </div>
            <div className="convenience-info">
              {/* 공공api에 자전거보관소(BICYCLE) 값이 모두 빈칸"" */}
              {/* <img src={getConvenienceInfo("BICYCLE").iconSrc} alt="자전거보관소" />
              <p style={{color: getConvenienceInfo("BICYCLE").textColor}}>자전거보관소</p> */}
              <img src={`/icons/bicycleshed-icon-y.svg`} alt="자전거보관소" />
              <p>자전거보관소</p>
            </div>
            <div className="convenience-info">
              <img src={getConvenienceInfo("WL").iconSrc} alt="휠체어리프트" />
              <p style={{color: getConvenienceInfo("WL").textColor}}>휠체어리프트</p>
            </div>
          </div>
        </div>

        {/* 역 정보(주소, 전화번호) */}
        <div>
          <div className="station-info-title">
            <p>역 정보</p>
          </div>
          <div className="station-info-container">
            <div className="station-info-addr">
              <p className='color-gray' >주소</p>
              {/* <p>서울특별시 중구 세종대로 지하2(남대문로 5가)</p> */}
              <p>{currentStationInfo?.ROAD_NM_ADDR || "정보 없음"}</p>
            </div>
            <div className="station-info-tel">
              <p className='color-gray' >전화번호</p>
              {/* <p>02-6110-1331</p> */}
              <p>{currentStationInfo?.TELNO || "정보 없음"}</p>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default Detail;