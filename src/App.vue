<template>
  <div id="app">
    <img
      src="@/assets/floodguard-logo.png"
      alt="Flood Guard Logo"
      class="logo"
    />

    <MapComponent :locationSelect="handleLocationSelect" />
    <div v-if="selectedLocation" class="location-info">
      <p>선택한 위치:</p>
      <p>위도: {{ selectedLocation.lat }}</p>
      <p>경도: {{ selectedLocation.lng }}</p>
      <p v-if="weatherData">현재 강수량: {{ weatherData.currentRain }} mm</p>
      <p v-if="weatherData">
        한 시간 뒤 강수량: {{ weatherData.oneHourRain }} mm
      </p>
      <p v-if="loading">정보를 가져오는 중...</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  
    <img
      src="@/assets/parking-register-icon.png"
      alt="주차 등록"
      @click="registerParking"
      style="position: fixed; bottom: 20px; left: 20px; z-index: 1000; width: 200px; height: 220px; cursor: pointer;"
    />

    <img
      src="@/assets/risk-check-icon.png"
      alt="위험도 확인"
      @click="checkRiskLevel"
      style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; width: 200px; height: 220px; cursor: pointer;"
    />

    <!-- 주차 완료 메시지 -->
    <div v-if="showParkingMessage" class="parking-message">
      <p>주차 완료</p>
    </div>

    <!-- 위험 아이콘 -->
    <div v-if="showRiskIcon" class="risk-icon">
      <img :src="riskIcon" alt="위험 아이콘" />
    </div>
  </div>
</template>

<script>
import MapComponent from "./components/MapComponent.vue";
import { getWeatherData } from "./services/WeatherService";
import { checkFloodHistory } from "./services/FloodHistoryService";
import { assessRisk } from "./services/RiskAssessmentService";

export default {
  components: {
    MapComponent,
  },
  data() {
    return {
      selectedLocation: null,
      weatherData: null,
      loading: false,
      error: null,
      showParkingMessage: false, 
      showRiskIcon: false, 
      riskIcon: "", 
    };
  },

  methods: {
    registerParking() {
      this.showParkingMessage = true;
      setTimeout(() => {
        this.showParkingMessage = false;
      }, 2000); 
    },

    async checkRiskLevel() {
      // 위험도 확인 기능
      console.log("위험도 확인 버튼 클릭됨");
      // 위험 지역 판별을 위한 가상의 조건
      const floodRiskLevel = Math.floor(Math.random() * 3); // 0, 1, 2 중 랜덤 값

    // floodRiskLevel에 따라 다르게 이미지 설정
    if (floodRiskLevel === 2) {
      this.riskIcon = require('@/assets/warning-icon.png'); // 경고 아이콘
      } else if (floodRiskLevel === 1) {
      this.riskIcon = require('@/assets/danger-icon.png'); // 위험 아이콘
      } else {
        this.riskIcon = require('@/assets/safe-icon.png'); // 안전 지역 아이콘
      }
      this.showRiskIcon = true; 

      setTimeout(() => {
        this.showRiskIcon = false; // 2초 뒤 아이콘 제거
      }, 2000); 
    },

    async handleLocationSelect(lat, lng) {
      console.log("Location selected:", lat, lng);
      this.selectedLocation = { lat, lng };
      this.loading = true;
      this.error = null;

      try {
        console.log("Fetching weather data...");
        this.weatherData = await getWeatherData(lat, lng);
        console.log("Weather data received:", this.weatherData);

        const currentRainfall =
          this.weatherData && this.weatherData.currentRain !== "N/A"
            ? this.weatherData.currentRain
            : "강수없음";
        const oneHourRainfall =
          this.weatherData && this.weatherData.oneHourRain !== "N/A"
            ? this.weatherData.oneHourRain
            : "강수없음";

        const [x, y] = this.latLngToEPSG3857(lat, lng);
        const floodData = await checkFloodHistory(x, y);
        console.log("Flood history data:", floodData);

        if (floodData) {
          alert("이 위치는 침수 이력이 있는 지역입니다.");
        } else {
          alert("이 위치는 침수 이력이 없는 지역입니다.");
        }

        const riskMessage = assessRisk(
          currentRainfall,
          oneHourRainfall,
          floodData
        );
        alert(riskMessage);
      } catch (error) {
        this.error = "정보를 가져오는 중 오류가 발생했습니다.";
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },
    latLngToEPSG3857(lat, lng) {
      const x = (lng * 20037508.34) / 180;
      const y =
        Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
      const yConverted = (y * 20037508.34) / 180;
      return [x, yConverted];
    },
  },
};
</script>

<style scoped>
/* 로고 스타일: 화면 왼쪽 상단에 고정 위치 */
.logo {
  position: fixed; /* 고정 위치 */
  top: 10px; /* 화면 상단에서 10px 떨어짐 */
  left: 10px; /* 화면 왼쪽에서 10px 떨어짐 */
  width: 150px; /* 로고 크기 조정 */
  height: auto;
  z-index: 1000; /* 다른 요소 위에 표시되도록 설정 */
}

.map {
  width: 100vw;
  height: 100vh;
}

.location-info {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.parking-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* 정확히 중앙에 배치 */
  background-color: #333;
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  font-size: 20px;
}

.risk-icon {
  position: fixed;
  top: 50%;    /* 화면의 세로 중앙 */
  left: 50%;   /* 화면의 가로 중앙 */
  transform: translate(-50%, -50%); /* 정확한 중앙 정렬 */
  z-index: 1001;  /* 다른 요소보다 위에 보이도록 설정 */
  width: 100px;   /* 위험 아이콘 크기 */
  height: 100px;
}

.error {
  color: red;
}

.app-header {
  width: 100%;
}
</style>
