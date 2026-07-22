import React, { useMemo, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTE_DISPLAY } from "../../configs/line-list-configs/subwayLinesRouteConfig.js";
import LINE_COLORS from "../../configs/lineColors.js";

/* linesDetailConfigs: 프로젝트에서 이미 분리한 유틸/상수들 */
import { canonical } from "../../components/linesdetail/linesDetailUtil.js";

import "./LinesDetail.css";

/* 라우트 파싱 */
const parseLineLabel = (lineId) => {
  const n = lineId?.match(/\d+/)?.[0] ?? "";
  return n ? `${n}호선` : String(lineId ?? "");
};


export default function LinesDetail() {
  const navigate = useNavigate();

  const { lineId } = useParams();
  const lineLabelFull = useMemo(() => parseLineLabel(lineId), [lineId]);

  
  const goToDetails = (station) =>
    navigate(`/linesdetail/${lineId}/details/${station}`);


  const lineColor = useMemo(
    () => LINE_COLORS[lineLabelFull] ?? "#000000",
    [lineLabelFull]
  );

  /* 역 배열 + index map (ROUTE_DISPLAY ↔ API statnNm 대조용) */
  const stations = useMemo(() => {
    const arr = Array.isArray(ROUTE_DISPLAY[lineLabelFull])
      ? ROUTE_DISPLAY[lineLabelFull]
      : [];
    return arr.map((name) => ({ name: String(name), key: canonical(name) }));
  }, [lineLabelFull]);

  const indexByName = useMemo(() => {
    const m = new Map();
    stations.forEach((st, i) => m.set(st.key, i));
    return m;
  }, [stations]);


  /* 스크롤/오버레이 refs & 상태 */
  const scrollerRef = useRef(null);
  const stationsListRef = useRef(null);

  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current || stationsListRef.current;
    if (!el) return;
    const update = () => {
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const y = el.scrollTop;
      setAtTop(y <= 0);
      setAtBottom(maxScroll > 0 ? y >= maxScroll - 1 : true);
      setHasOverflow(maxScroll > 0);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const displayNameOf = (name) =>
    name.length >= 7 ? name.slice(0, 5) + "..." : name;

  // 그라데이션
  const fadeTopStyle = {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 80,
    pointerEvents: "none",
    background:
      "linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))",
    opacity: atTop || !hasOverflow ? 0 : 1,
    transition: "opacity 160ms",
    zIndex: 999,
  };
  const fadeBottomStyle = {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    pointerEvents: "none",
    background:
      "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))",
    opacity: atBottom || !hasOverflow ? 0 : 1,
    transition: "opacity 160ms",
    zIndex: 999,
  };


  const [live, setLive] = useState([]);


  return (
    <div className="linesdetail-web-container"
      style={{ "--line-color": lineColor }}>

      {/* 바깥 박스틀 */}
      <div className="linesdetail-box">

        {/* n호선 표시 */}
        <div className="linesdetail-textbox">
          <div className="linesdetail-line-number">
            {lineLabelFull}
          </div>
        </div>
        
        {/* 흰배경 검은바탕선 박스틀 */}
        <div className="linesdetail-frame">


          <div className="stations-responsive-height">

            {/* 최상단/최하단 스크롤 아닐 시 상/하단 그라디언트 마스크 적용 */}
            <div style={fadeTopStyle} />
            <div style={fadeBottomStyle} /> 

            <div className="linesdetail-stations-height" ref={scrollerRef}>

               <div
                className={`linesdetail-stations linesdetail-hide-scrollbar
                  ${atTop ? "at-top" : ""} ${atBottom ? "at-bottom" : ""}`}
              >


            {/* 역 목록(같은 스크롤 좌표계, 오버레이 위) */}
            <div className="stations-lines" style={{ zIndex: 20 }}>
                {stations.map(({ name }, idx) => {
                                const branchLine = name.includes("지선");
                                const loopLine = name.includes("순환선");
                                const display = branchLine || loopLine ? name : displayNameOf(name);
                
                                const cls = [
                                  "linesdetail-station",
                                  branchLine && "linesdetail-branchLine",
                                  loopLine && "linesdetail-loopLine",
                                ]
                                  .filter(Boolean)
                                  .join(" ");
                
                                return (
                                  <React.Fragment key={`${name}-${idx}`}>
                                    <div className={`top-line-color ${idx === 0 ? "first" : ""}`} />
                                    <div className={cls} onClick={() => goToDetails(name)}>
                                      {display}
                                    </div>
                                    <div
                                      className={`bottom-line-color ${
                                        idx === stations.length - 1 ? "last" : ""
                                      }`}
                                    />
                                  </React.Fragment>
                                );
                              })}
                 </div>

                    </div>
                    
                  
              </div>
            </div>
          </div>

          </div>
          <div className="grid-spacer" aria-hidden="true" />
        </div>  
  );
}
