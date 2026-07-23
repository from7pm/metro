const ADDRESS_URL =
  "https://api.odcloud.kr/api/15041120/v1/uddi:f2dfe7b7-f0ee-43fa-bfd0-f6a316d14a35";

const PHONE_URL =
  "https://api.odcloud.kr/api/15041414/v1/uddi:0c427c29-75ff-4823-b7fe-cda0c8e1f0fc";

const normalizeStationName = (name = "") =>
  String(name)
    .normalize("NFC")
    .replace(/역$/, "")
    .replace(/\s+/g, "")
    .trim();

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");

    return response.status(405).json({
      message: "GET 요청만 지원합니다.",
    });
  }

  const apiKey = process.env.DATA_GO_KR_API_KEY;

  if (!apiKey) {
    return response.status(500).json({
      message: "공공데이터포털 인증키가 설정되지 않았습니다.",
    });
  }

  const station = String(request.query.station ?? "").trim();

  if (!station) {
    return response.status(400).json({
      message: "역 이름이 필요합니다.",
    });
  }

  const params = new URLSearchParams({
    page: "1",
    perPage: "200",
    returnType: "JSON",
    serviceKey: apiKey,
  });

  try {
    const [addressResponse, phoneResponse] = await Promise.all([
      fetch(`${ADDRESS_URL}?${params.toString()}`),
      fetch(`${PHONE_URL}?${params.toString()}`),
    ]);

    if (!addressResponse.ok || !phoneResponse.ok) {
      return response.status(502).json({
        message: "국가철도공단 API 호출에 실패했습니다.",
      });
    }

    const [addressResult, phoneResult] = await Promise.all([
      addressResponse.json(),
      phoneResponse.json(),
    ]);

    const stationKey = normalizeStationName(station);

    const addressItem = (addressResult.data ?? []).find(
      (item) =>
        normalizeStationName(
          item["역명"] ?? item.STIN_NM,
        ) === stationKey,
    );

    const phoneItem = (phoneResult.data ?? []).find(
      (item) =>
        normalizeStationName(
          item["역명"] ?? item.STIN_NM,
        ) === stationKey,
    );

    const address =
      addressItem?.["도로명주소"] ??
      addressItem?.ROAD_NM_ADR ??
      addressItem?.["지번주소"] ??
      addressItem?.LONM_ADR ??
      null;

    const phone =
      phoneItem?.["전화번호"] ??
      phoneItem?.TEL_NO ??
      null;

    response.setHeader(
      "Cache-Control",
      "s-maxage=86400, stale-while-revalidate=604800",
    );

    return response.status(200).json({
      station,
      address,
      phone,
    });
  } catch (error) {
    console.error("Rail API request failed:", error);

    return response.status(502).json({
      message: "국가철도공단 API 호출에 실패했습니다.",
    });
  }
}