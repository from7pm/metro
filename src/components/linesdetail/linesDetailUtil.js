/* ───────── 픽셀 모델 */
export const TOP_CAP = 21;
export const BTM_CAP = 21;
export const STATION_H = 36;
export const GAP = 42;
export const STEP = STATION_H + GAP; // 78

/* ───────── 이름 정규화 + 별칭 */
export const normalizeName = (name = "") =>
  String(name)
    .normalize("NFC")
    .replace(/역$/, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[·.\-]/g, "")
    .replace(/\s+/g, "")
    .trim();

export const ALIASES = new Map([
  ["총신대", "이수"],
  ["총신대입구", "이수"],
  ["이수", "이수"],
  ["서울역", "서울"],
  ["서울", "서울역"],
  ["서울", "서울"],
]);

export const canonical = (raw) => {
  const n = normalizeName(raw);
  return ALIASES.get(n) || n;
};

/* ───────── 유틸 */
export const parseLineLabel = (lineId) => {
  const n = lineId?.match(/\d+/)?.[0] ?? "";
  return n ? `${n}호선` : String(lineId ?? "");
};

export const keyBase = (t) => {
  const no  = t.btrainNo || t.trainNo || t.btrain || t.trainId || "no";
  const dir = t.updnLine || t.direction || t.dir || "dir";
  const sid = t.statnId || t.statnFid || t.statnTid || "sid";
  return `${no}-${dir}-${sid}`;
};

export const toDir = (v) => {
  const s = String(v ?? "");
  if (/상|내|up|UP|상행/.test(s)) return "up";
  if (/하|외|down|DOWN|하행/.test(s)) return "down";
  if (s === "0") return "up";
  if (s === "1") return "down";
  return "down";
};

export const toETA = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const progressBetween = (t) => {
  const sec = Number(t.barvlDt || t.remainSeconds || NaN);
  if (!Number.isNaN(sec)) {
    const clamp = (x) => Math.min(1, Math.max(0, x));
    return clamp(1 - sec / 60);
  }
  const msg = String(t.arvlMsg2 || t.msg || "");
  if (/(도착|접근)/.test(msg)) return 1;
  if (/(진입)/.test(msg)) return 0.9;
  if (/(출발)/.test(msg)) return 0.1;
  if (/(전역)/.test(msg)) return 0.25;
  return 0.5;
};

// 노선 라벨 → subwayId 매핑 (중복/오타 정리)
export const SUBWAY_ID_BY_LABEL = {
  "1호선": ["1001"],
  "2호선": ["1002"],
  "3호선": ["1003"],
  "4호선": ["1004"],
  "5호선": ["1005"],
  "6호선": ["1006"],
  "7호선": ["1007"],
  "8호선": ["1008"],
  "9호선": ["1009"],
  "경의중앙선": ["1063"],     // (일반적으로 중앙선 표기는 경의중앙선으로 통합됨)
  "경춘선": ["1067"],
  "수인분당선": ["1075"],     // 표기 통일: 수인분당선
  "신분당선": ["1077"],
  "우이신설선": ["1092"],
  "GTX-A": ["1032"],
};

// 보조: subwayId → 대표 라벨(표시용)
export const SUBWAY_ID_LABEL =
  Object.fromEntries(
    Object.entries(SUBWAY_ID_BY_LABEL).flatMap(([label, ids]) =>
      ids.map((id) => [Number(id), label])
    )
  );
