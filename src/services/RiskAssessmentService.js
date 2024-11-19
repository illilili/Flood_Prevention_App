import axios from "axios";

// 침수 유발 강우량 정보를 가져오는 함수
async function getFloodRainfallThresholds(lat, lon) {
  if (typeof lat !== "number" || typeof lon !== "number") {
    console.error("Invalid coordinates provided:", lat, lon);
    return { depth_10: null, depth_20: null, depth_50: null };
  }

  try {
    const response = await axios.post(
      "http://localhost:3000/api/getFloodThresholds",
      {
        lat: lat,
        lon: lon,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching flood thresholds:", error);
    return { depth_10: null, depth_20: null, depth_50: null };
  }
}

// 위험 수준을 평가하는 함수
export async function assessRisk(currentRainfall, oneHourRainfall, lat, lon) {
  // 침수 유발 강우량을 DB에서 조회
  const { depth_10, depth_20, depth_50 } = await getFloodRainfallThresholds(
    lat,
    lon
  );

  console.log(
    `Thresholds from DB - 10cm: ${depth_10}, 20cm: ${depth_20}, 50cm: ${depth_50}`
  );

  let floodRiskLevel = 0; // 0: 안전, 1: 위험, 2: 매우 위험
  if (
    (currentRainfall >= depth_10 || oneHourRainfall >= depth_10) &&
    depth_10 !== null
  ) {
    floodRiskLevel = 1; // 위험
  } else if (
    (currentRainfall >= depth_20 || oneHourRainfall >= depth_20) &&
    depth_20 !== null
  ) {
    floodRiskLevel = 1; // 위험
  } else if (
    (currentRainfall >= depth_50 || oneHourRainfall >= depth_50) &&
    depth_50 !== null
  ) {
    floodRiskLevel = 2; // 매우 위험
  }

  // 위험도 메시지
  let alertMessage = "현재 위치의 침수 위험도는 안전입니다.";
  if (floodRiskLevel === 1) {
    alertMessage = "경고: 강우량이 침수유발 기준치에 도달했습니다.";
  } else if (floodRiskLevel === 2) {
    alertMessage = "위험: 50CM 침수 유발 강우량에 도달하여 매우 위험합니다.";
  }

  // 콘솔에 결과 출력
  console.log(alertMessage);

  // 위험 레벨과 알림 메시지 반환
  return { floodRiskLevel, alertMessage };
}
