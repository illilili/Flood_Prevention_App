export async function checkFloodHistory(lat, lng) {
  // BBOX 설정: 지도 경계를 lat, lng 주변 0.01도 범위로 설정
  const bbox = `${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}`;

  // 지도 크기와 좌표 변환 설정
  const width = 101;
  const height = 101;

  // GetFeatureInfo 요청을 위한 프록시 서버 URL 구성
  const proxyUrl = `http://localhost:3000/safemap?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=A2SM_FLUDMARKS&STYLES=A2SM_FludMarks&FORMAT=image/png&INFO_FORMAT=application/json&BBOX=${bbox}&CRS=EPSG:4326&WIDTH=${width}&HEIGHT=${height}&I=50&J=50`;

  try {
    const response = await fetch(proxyUrl);
    const responseText = await response.text();

    // HTML 오류 응답 확인
    if (
      responseText.startsWith("<!DOCTYPE html>") ||
      responseText.startsWith("<html")
    ) {
      console.error("HTML 오류 응답:", responseText);
      throw new Error("API에서 JSON이 아닌 HTML 응답을 받았습니다.");
    }

    // JSON 파싱 시도
    const data = JSON.parse(responseText);

    // 피처 정보 확인
    return data.features && data.features.length > 0;
  } catch (error) {
    console.error("Error fetching flood history data:", error);
    return false;
  }
}
