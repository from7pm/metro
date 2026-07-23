const ROUTE_URL = "http://www.seoulmetro.co.kr/kr/getRouteSearchResult.do";
const ALLOWED_FIELDS = ["departureId", "arrivalId", "sKind"];

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ message: "POST 요청만 지원합니다." });
  }

  const requestBody =
    typeof request.body === "string"
      ? Object.fromEntries(new URLSearchParams(request.body))
      : request.body ?? {};

  const params = new URLSearchParams();
  for (const field of ALLOWED_FIELDS) {
    const value = requestBody[field];
    if (value !== undefined && value !== null) {
      params.set(field, String(value));
    }
  }

  if (ALLOWED_FIELDS.some((field) => !params.get(field))) {
    return response.status(400).json({ message: "경로 검색 값이 부족합니다." });
  }

  try {
    const upstream = await fetch(ROUTE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "application/xml, text/xml, */*; q=0.01",
        Origin: "http://www.seoulmetro.co.kr",
        Referer: "http://www.seoulmetro.co.kr/kr/cyberStation.do",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: params.toString(),
    });
    const body = await upstream.text();

    response.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/xml; charset=utf-8",
    );
    return response.status(upstream.status).send(body);
  } catch (error) {
    console.error("Route API request failed:", error);
    return response.status(502).json({ message: "지하철 경로 조회에 실패했습니다." });
  }
}
