import axios from "axios";

// 인코딩된 API 키 사용
const API_KEY =
  "3U2Vinr%2BRnlR6KVJFlE5duBEM1IWvJIE%2B4Px6aUXNdGJNoxSv14X%2BRrw5MBq4%2F8EKqLhR1IT9PYrppCdeCsz%2FQ%3D%3Ds";
const API_URL =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

export const getWeatherData = async (latitude, longitude) => {
  try {
    const nx = convertToGridX(latitude); // 위도를 격자 X 좌표로 변환
    const ny = convertToGridY(longitude); // 경도를 격자 Y 좌표로 변환

    // API URL에 파라미터 직접 포함
    const requestUrl = `${API_URL}?serviceKey=${API_KEY}&numOfRows=10&pageNo=1&base_date=${getTodayDate()}&base_time=${getCurrentTime()}&nx=${nx}&ny=${ny}&dataType=JSON`;

    const response = await axios.get(requestUrl);

    // 응답 데이터 콘솔에 출력
    console.log("API 응답 전체 데이터:", response.data);

    // 응답 데이터의 구조 확인
    if (!response.data || !response.data.response) {
      console.error("응답 데이터에서 'response'가 없습니다:", response.data);
      return null;
    }

    const body = response.data.response.body;
    if (!body || !body.items) {
      console.error(
        "응답 데이터에서 'body' 또는 'items'가 없습니다:",
        response.data.response
      );
      return null;
    }

    const weatherItems = body.items.item;

    // 현재 강수량 정보 추출
    const currentRainInfo = weatherItems.find(
      (item) => item.category === "PCP"
    );
    const currentRainValue = currentRainInfo
      ? currentRainInfo.fcstValue
      : "강수없음";

    // 한 시간 뒤 강수량 정보 추출
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1);
    const nextHourTime = ("0" + nextHour.getHours()).slice(-2) + "00";

    const oneHourRainInfo = weatherItems.find(
      (item) => item.fcstTime === nextHourTime && item.category === "PCP"
    );
    const oneHourRainValue = oneHourRainInfo
      ? oneHourRainInfo.fcstValue
      : "강수없음";

    return {
      currentRain: currentRainValue,
      oneHourRain: oneHourRainValue,
    };
  } catch (error) {
    console.error("API 요청 오류:", error);
    return null;
  }
};

// 오늘 날짜를 구하는 함수 (YYYYMMDD 포맷)
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = ("0" + (today.getMonth() + 1)).slice(-2);
  const day = ("0" + today.getDate()).slice(-2);
  return `${year}${month}${day}`;
}

// 현재 시간을 구하는 함수 (HHMM 형식)
function getCurrentTime() {
  const now = new Date();
  const hours = ("0" + now.getHours()).slice(-2);
  return `${hours}00`;
}

// 위도, 경도를 기상청 격자 좌표로 변환하는 함수
function convertToGridX(lat) {
  return Math.round((lat - 30.0) * 24.0);
}

function convertToGridY(lon) {
  return Math.round((lon - 126.0) * 24.0);
}
