import axios from "axios";

// 침수 유발 강우량 정보를 가져오는 함수
async function getFloodRainfallThresholds(lat, lon) {
  console.log("getFloodRainfallThresholds called with lat:", lat, "lon:", lon);
  console.log("Sending coordinates to server:", lat, lon); // 좌표 확인
  if (typeof lat !== "number" || typeof lon !== "number") {
    console.error("Invalid coordinates provided:", lat, lon);
    return { depth_10: null, depth_20: null, depth_50: null };
  }

  try {
    console.log(
      `Requesting flood thresholds for coordinates: lat=${lat}, lon=${lon}`
    );
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

  // 위험 수준 평가 및 알림 메시지 생성
  let alertMessage = "현재 위치의 침수 위험도는 안전합니다.";
  if (
    (currentRainfall >= depth_10 || oneHourRainfall >= depth_10) &&
    depth_10 !== null
  ) {
    alertMessage = "위험: 현재 또는 예상 강우량이 10cm 기준치에 도달했습니다.";
  } else if (
    (currentRainfall >= depth_20 || oneHourRainfall >= depth_20) &&
    depth_20 !== null
  ) {
    alertMessage = "위험: 현재 또는 예상 강우량이 20cm 기준치에 도달했습니다.";
  } else if (
    (currentRainfall >= depth_50 || oneHourRainfall >= depth_50) &&
    depth_50 !== null
  ) {
    alertMessage =
      "경고: 현재 또는 예상 강우량이 50cm에 도달하여 매우 위험합니다.";
  }

  // 콘솔에 결과 출력
  console.log(alertMessage);

  // 알림 메시지 반환
  return alertMessage;
}
