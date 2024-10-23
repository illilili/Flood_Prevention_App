export async function checkFloodHistory(lat, lng) {
  const bbox = `${lng},${lat},${lng + 0.01},${lat + 0.01}`; // BBOX 좌표 설정

  // 프록시 서버를 통해 Safemap API 요청을 중계
  const proxyUrl = `http://localhost:3000/safemap?query=SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&FORMAT=image/png&LAYERS=A2SM_FLUDMARKS&INFO_FORMAT=application/json&BBOX=${bbox}&CRS=EPSG:4326&WIDTH=101&HEIGHT=101&I=50&J=50&apikey=89B1UZBS-89B1-89B1-89B1-89B1UZBSFR`;

  try {
    const response = await fetch(proxyUrl);

    // 응답이 HTML인지 확인
    const responseText = await response.text();

    // HTML 오류 메시지 확인
    if (responseText.includes("alert('키 값이 맞지 않습니다.')")) {
      throw new Error("API 키가 유효하지 않습니다.");
    }

    // JSON 파싱 시도
    const data = JSON.parse(responseText);

    // 침수 이력이 있는지 확인
    return data.features && data.features.length > 0;
  } catch (error) {
    console.error("Error fetching flood history data:", error);
    return false;
  }
}
