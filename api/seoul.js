const DATASETS = {
  arrival: {
    baseUrl: "http://swopenapi.seoul.go.kr/api/subway",
    service: "realtimeStationArrival",
  },
  evacuation: {
    baseUrl: "http://openapi.seoul.go.kr:8088",
    service: "SmrtEmergerncyGuideImg",
  },
  convenience: {
    baseUrl: "http://openapi.seoul.go.kr:8088",
    service: "TbSeoulmetroStConve",
  },
  station: {
    baseUrl: "http://openapi.seoul.go.kr:8088",
    service: "StationAdresTelno",
  },
  search: {
    baseUrl: "http://openapi.seoul.go.kr:8088",
    service: "SearchInfoBySubwayNameService",
  },
};

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ message: "GET 요청만 지원합니다." });
  }

  const apiKey = process.env.SEOUL_API_KEY;
  if (!apiKey) {
    return response.status(500).json({
      message: "Vercel 환경변수 SEOUL_API_KEY가 설정되지 않았습니다.",
    });
  }

  const dataset = String(request.query.dataset ?? "");
  const config = DATASETS[dataset];

  if (!config) {
    return response.status(400).json({
      message: "지원하지 않는 데이터 종류입니다.",
    });
  }

  const station =
    dataset === "arrival"
      ? String(request.query.station ?? "").trim()
      : "";

  if (dataset === "arrival" && !station) {
    return response.status(400).json({
      message: "도착정보 조회에는 역 이름이 필요합니다.",
    });
  }

  const start = Number(request.query.start ?? 1);
  const end = Number(request.query.end ?? 850);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > 1000) {
    return response.status(400).json({ message: "조회 범위가 올바르지 않습니다." });
  }

  const path = [
    config.baseUrl,
    encodeURIComponent(apiKey),
    "json",
    config.service,
    start,
    end,
    dataset === "arrival"
      ? encodeURIComponent(station)
      : config.suffix,
  ]
    .filter(Boolean)
    .join("/");

  try {
    const upstream = await fetch(path);
    const body = await upstream.text();

    response.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
    );

    response.setHeader(
      "Cache-Control",
      dataset === "arrival"
        ? "no-store"
        : "s-maxage=300, stale-while-revalidate=600",
    );

    return response.status(upstream.status).send(body);
  } catch (error) {
    console.error("Seoul API request failed:", error);

    return response.status(502).json({
      message: "서울시 API 호출에 실패했습니다.",
    });
  }
}