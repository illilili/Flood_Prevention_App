import axios from 'axios';

const API_KEY = '3U2Vinr%2BRnlR6KVJFlE5duBEM1IWvJIE%2B4Px6aUXNdGJNoxSv14X%2BRrw5MBq4%2F8EKqLhR1IT9PYrppCdeCsz%2FQ%3D%3D'; // Encoding된 인증키
const API_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';

export const getWeatherData = async (latitude, longitude) => {
  try {
    // 위경도 좌표를 기상청 격자 좌표로 변환해야 합니다.
    const nx = convertToGridX(latitude);
    const ny = convertToGridY(longitude);

    const response = await axios.get(API_URL, {
      params: {
        serviceKey: API_KEY,
        numOfRows: 10,
        pageNo: 1,
        base_date: getTodayDate(),
        base_time: '0600', // 기상청 예보 기준 시각
        nx, // 격자 X 좌표
        ny, // 격자 Y 좌표
        dataType: 'JSON', // JSON 형식으로 데이터 요청
      },
    });
    
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
};

// 오늘 날짜를 구하는 함수 (YYYYMMDD 포맷)
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = ('0' + (today.getMonth() + 1)).slice(-2);
  const day = ('0' + today.getDate()).slice(-2);
  return `${year}${month}${day}`;
}

// 위도, 경도를 기상청 격자 좌표로 변환하는 함수 (임시 예시)
function convertToGridX(lat) {
  return Math.floor(lat); // 좌표 변환 로직은 정확히 구현해야 함
}

function convertToGridY(lon) {
  return Math.floor(lon); // 좌표 변환 로직은 정확히 구현해야 함
}
