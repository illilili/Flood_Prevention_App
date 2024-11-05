// App.vue
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
    async handleLocationSelect(lat, lng) {
      console.log("Location selected:", lat, lng); // 위치 확인용 로그
      this.selectedLocation = { lat, lng };
      this.loading = true;
      this.error = null;

      // 날씨 정보 가져오기
      try {
        this.weatherData = await getWeatherData(lat, lng);
        console.log("Weather data:", this.weatherData); // 날씨 데이터 확인 로그
      } catch (error) {
        this.error = "기상 정보를 가져오는 데 실패했습니다.";
      }

      // 침수 이력 확인
      const [x, y] = this.latLngToEPSG3857(lat, lng);
      try {
        const floodData = await checkFloodHistory(x, y);
        console.log("Flood history data:", floodData); // 침수 이력 확인 로그
        if (floodData) {
          alert("이 위치는 침수 이력이 있는 지역입니다.");
        } else {
          alert("이 위치는 침수 이력이 없는 지역입니다.");
        }
      } catch (error) {
        this.error = "침수 이력 정보를 가져오는 데 실패했습니다.";
      }

      this.loading = false;
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
</style>
