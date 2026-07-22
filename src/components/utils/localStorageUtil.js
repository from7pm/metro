// src/utils/localStorageUtil.js
const SEOUL_LINES_KEY = "seoul_lines_v1";
const keyForLine = (lineNum) => `seoul_lines_v1:${lineNum}`; // 선택사항(라인별 캐시)

export const localStorageUtil = {
  clearLocalStorage: () => {
    try { localStorage.clear(); } catch {}
  },
 
  // 전체/최근 조회 라인 1개분 캐시 (slice에서 쓰는 이름과 맞춤)
  setSeoulLines: (data) => {
    try { localStorage.setItem(SEOUL_LINES_KEY, JSON.stringify(data)); } catch {}
  },
  getSeoulLines: () => {
    try {
      const raw = localStorage.getItem(SEOUL_LINES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  removeSeoulLines: () => {
    try { localStorage.removeItem(SEOUL_LINES_KEY); } catch {}
  },

  // (옵션) 라인별 캐시가 필요하면 이거 써
  setLine: (lineNum, data) => {
    try { localStorage.setItem(keyForLine(lineNum), JSON.stringify(data)); } catch {}
  },
  getLine: (lineNum) => {
    try {
      const raw = localStorage.getItem(keyForLine(lineNum));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  removeLine: (lineNum) => {
    try { localStorage.removeItem(keyForLine(lineNum)); } catch {}
  },
};

export const storageKeys = { SEOUL_LINES_KEY, keyForLine };