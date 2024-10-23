import axios from "axios";

const API_KEY =
  "3U2Vinr+RnlR6KVJFlE5duBEM1IWvJIE+4Px6aUXNdGJNoxSv14X+Rrw5MBq4/8EKqLhR1IT9PYrppCdeCsz/Q=="; // 기상청 API 키
const API_URL =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

// baseTime을 구하는 함수 (가장 최근 3시간 단위의 베이스타임)
function getClosestBaseTime() {
  const now = new Date();
  const hours = now.getHours();

  // 기상청의 baseTime은 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300
  const baseTimes = [
    "0200",
    "0500",
    "0800",
    "1100",
    "1400",
    "1700",
    "2000",
    "2300",
  ];

  // 현재 시간을 기준으로 가장 가까운 이전 baseTime을 찾는다
  let closestBaseTime = baseTimes[0]; // 기본값을 설정
  for (let i = 0; i < baseTimes.length; i++) {
    const baseHour = parseInt(baseTimes[i].substring(0, 2), 10); // baseTime의 시간을 숫자로 변환
    if (hours >= baseHour) {
      closestBaseTime = baseTimes[i]; // 현재 시간에 해당하는 가장 가까운 baseTime
    }
  }

  return closestBaseTime;
}

// 오늘 날짜를 구하는 함수 (YYYYMMDD 포맷)
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = ("0" + (today.getMonth() + 1)).slice(-2);
  const day = ("0" + today.getDate()).slice(-2);
  return `${year}${month}${day}`;
}

export const getWeatherData = async (latitude, longitude) => {
  try {
    const nx = convertToGridX(latitude); // 위도를 격자 X 좌표로 변환
    const ny = convertToGridY(longitude); // 경도를 격자 Y 좌표로 변환

    const baseDate = getTodayDate(); // 오늘 날짜
    const baseTime = getClosestBaseTime(); // 가장 가까운 baseTime (예: 1700)

    const response = await axios.get(API_URL, {
      params: {
        serviceKey: API_KEY, // API 키
        numOfRows: 100, // 이후 시간대를 포함한 데이터를 모두 가져오기 위해 개수 증가
        pageNo: 1, // 페이지 번호
        base_date: baseDate, // 오늘 날짜
        base_time: baseTime, // 가장 가까운 baseTime (예: 1700)
        nx, // 격자 X 좌표
        ny, // 격자 Y 좌표
        dataType: "JSON", // 응답 형식
      },
    });

    // 응답 데이터 콘솔에 출력
    console.log("API 응답 데이터:", response.data);

    if (
      !response.data ||
      !response.data.response ||
      !response.data.response.body
    ) {
      console.error("API 응답 오류:", response.data);
      return null; // 데이터가 없을 경우 null 반환
    }

    // 응답 데이터 처리
    const weatherItems = response.data.response.body.items.item;

    // 19시 및 20시 강수량 정보 추출
    const targetTimes = ["1900", "2000"]; // 원하는 시간대: 19시, 20시
    const rainInfos = targetTimes.map((targetTime) => {
      return (
        weatherItems.find(
          (item) => item.fcstTime === targetTime && item.category === "PCP"
        ) || { fcstTime: targetTime, fcstValue: "N/A" }
      );
    });

    return {
      currentRain: rainInfos[0] ? rainInfos[0].fcstValue : "N/A", // 현재 시각의 강수량 (19시)
      oneHourRain: rainInfos[1] ? rainInfos[1].fcstValue : "N/A", // 한 시간 뒤 강수량 (20시)
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

// 위도, 경도를 기상청 격자 좌표로 변환하는 함수
function convertToGridX(lat) {
  return Math.round((lat - 30.0) * 24.0); // 대략적인 변환 로직
}

function convertToGridY(lon) {
  return Math.round((lon - 126.0) * 24.0); // 대략적인 변환 로직
}
