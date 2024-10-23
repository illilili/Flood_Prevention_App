import axios from "axios";

const API_KEY =
  "3U2Vinr+RnlR6KVJFlE5duBEM1IWvJIE+4Px6aUXNdGJNoxSv14X+Rrw5MBq4/8EKqLhR1IT9PYrppCdeCsz/Q=="; // 기상청 API 키
const API_URL =
  "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst";

export const getWeatherData = async (latitude, longitude) => {
  try {
    const nx = convertToGridX(latitude); // 위도를 격자 X 좌표로 변환
    const ny = convertToGridY(longitude); // 경도를 격자 Y 좌표로 변환

    const response = await axios.get(API_URL, {
      params: {
        serviceKey: API_KEY, // API 키
        numOfRows: 10, // 페이지당 결과 수
        pageNo: 1, // 페이지 번호
        base_date: getTodayDate(), // 오늘 날짜
        base_time: getCurrentTime(), // 현재 시각 (정시 기준)
        nx, // 격자 X 좌표
        ny, // 격자 Y 좌표
        dataType: "JSON", // 응답 형식
      },
    });

    // 응답 데이터 콘솔에 출력
    console.log("API 응답 데이터:", response.data);

    // 응답 데이터의 구조 확인
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

    // 현재 강수량 정보 추출
    const currentRainInfo = weatherItems.find(
      (item) => item.category === "PCP"
    );
    const currentRainValue = currentRainInfo
      ? currentRainInfo.fcstValue
      : "N/A"; // 현재 강수량

    // 한 시간 뒤 강수량 정보 추출
    const nextHour = new Date(); // 현재 시간 가져오기
    nextHour.setHours(nextHour.getHours() + 1); // 한 시간 뒤로 설정
    const nextHourTime = ("0" + nextHour.getHours()).slice(-2) + "00"; // HH00 형식으로 변환

    let oneHourRainInfo = weatherItems.find(
      (item) => item.fcstTime === nextHourTime && item.category === "PCP"
    );

    // 1시간 뒤 강수량이 없으면 그 이후 시간을 찾기
    if (!oneHourRainInfo) {
      // 현재 시간 이후의 모든 강수량 예측 데이터를 필터링
      const futureRainInfos = weatherItems
        .filter(
          (item) => item.fcstTime > nextHourTime && item.category === "PCP"
        )
        .sort((a, b) => a.fcstTime - b.fcstTime); // 시간순으로 정렬

      // 가장 가까운 이후 시간대의 데이터를 선택
      oneHourRainInfo = futureRainInfos.length > 0 ? futureRainInfos[0] : null;
    }

    const oneHourRainValue = oneHourRainInfo
      ? oneHourRainInfo.fcstValue
      : "N/A"; // 한 시간 뒤 강수량

    return {
      currentRain: currentRainValue, // 현재 강수량
      oneHourRain: oneHourRainValue, // 한 시간 뒤 강수량
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
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
  return `${hours}00`; // 정시 기준으로 반환
}

// 위도, 경도를 기상청 격자 좌표로 변환하는 함수
function convertToGridX(lat) {
  // 기상청의 공식 격자 변환 로직을 사용해야 합니다.
  return Math.round((lat - 30.0) * 24.0); // 대략적인 변환 로직
}

function convertToGridY(lon) {
  // 기상청의 공식 격자 변환 로직을 사용해야 합니다.
  return Math.round((lon - 126.0) * 24.0); // 대략적인 변환 로직
}
