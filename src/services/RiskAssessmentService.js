export function assessRisk(currentRainfall, oneHourRainfall, floodHistory) {
  let riskThreshold = floodHistory ? 10 : 20;

  if (currentRainfall >= riskThreshold || oneHourRainfall >= riskThreshold) {
    return "위험: 현재 또는 예상 강우량이 기준치에 도달했습니다.";
  } else if (currentRainfall >= 50 || oneHourRainfall >= 50) {
    return "경고: 현재 또는 예상 강우량이 50cm에 도달하여 매우 위험합니다.";
  } else {
    return "현재 위치는 안전합니다.";
  }
}
