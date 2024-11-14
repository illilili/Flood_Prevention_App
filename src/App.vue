<template>
  <div id="app">
    <header class="app-header" style="padding: 10px; display: flex; align-items: center; justify-content: flex-start;">
      <img src="@/assets/floodguard-logo.png" alt="Flood Guard Logo" style="width: 200px; height: auto; margin-left: 10px;" />
</header>

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
  
     <!-- 왼쪽 하단 주차 등록 버튼 -->
     <button
      @click="registerParking"
      style="position: fixed; bottom: 20px; left: 20px; z-index: 1000; width: 160px; height: 60px; font-size: 16px; border-radius: 12px; padding: 10px; background-color: #4CAF50; color: white; border: none; cursor: pointer;"
      >
      주차 등록
    </button>

    <!-- 오른쪽 하단 현재 위치 위험도 확인 버튼 -->
    <button
      @click="checkRiskLevel"
      style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; width: 160px; height: 60px; font-size: 16px; border-radius: 12px; padding: 10px; background-color: #FF0000; color: white; border: none; cursor: pointer;"
      >
      현재 위치 위험도 확인
    </button>
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
    };
  },
  methods: {
    registerParking() {
      // 주차 등록 기능
      console.log("주차 등록 버튼 클릭됨");
    },
    checkRiskLevel() {
      // 현재 위치 위험도 확인 기능
      console.log("현재 위치 위험도 확인 버튼 클릭됨");
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
.error {
  color: red;
}
.app-header {
  width: 100%;
}
</style>
