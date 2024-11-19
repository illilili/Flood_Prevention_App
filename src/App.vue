<template>
  <div id="app">
    <header class="app-header">
      <h3>Flood Prevention</h3>
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
      monitorInterval: null, // 모니터링 타이머
    };
  },

  methods: {
    async handleLocationSelect(lat, lng) {
      console.log("Location selected:", lat, lng);
      this.selectedLocation = { lat, lng };
      this.loading = true;
      this.error = null;

      // 기존 모니터링을 해제하고 새로 설정
      if (this.monitorInterval) {
        clearInterval(this.monitorInterval);
        this.monitorInterval = null;
      }

      try {
        await this.checkAndAlert(lat, lng);

        // 1시간마다 강수 정보를 새로 요청하여 위험 모니터링
        this.monitorInterval = setInterval(async () => {
          await this.checkAndAlert(lat, lng, true);
        }, 3600000); // 1시간 = 3600000 밀리초
      } catch (error) {
        this.error = "정보를 가져오는 중 오류가 발생했습니다.";
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },

    async checkAndAlert(lat, lng, isPeriodic = false) {
      try {
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

        // 주차 위치의 첫 번째 알림
        if (!isPeriodic) {
          if (floodData) {
            alert("이 위치는 침수 이력이 있는 지역입니다.");
          } else {
            alert("이 위치는 침수 이력이 없는 지역입니다.");
          }
        }

        // 위험 수준 평가 및 알림
        const riskMessage = await assessRisk(
          currentRainfall,
          oneHourRainfall,
          lat,
          lng
        );

        // 주기적 검사에서 위험 감지 시 알림
        if (
          isPeriodic &&
          riskMessage !== "현재 위치의 침수 위험도는 안전합니다."
        ) {
          alert(riskMessage);
        }
      } catch (error) {
        console.error("Error checking risk:", error);
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

  beforeUnmount() {
    // 컴포넌트가 제거될 때 모니터링을 해제
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
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
</style>
