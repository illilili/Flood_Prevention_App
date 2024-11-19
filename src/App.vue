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
      style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        width: 200px;
        height: 220px;
        cursor: pointer;
      "
    />

    <img
      src="@/assets/risk-check-icon.png"
      alt="위험도 확인"
      @click="checkRiskLevel"
      style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        width: 200px;
        height: 220px;
        cursor: pointer;
      "
    />

    <!-- 주차 완료 메시지 -->
    <div v-if="showParkingMessage" class="parking-message">
      <p>주차 위치 등록 완료</p>
    </div>

    <!-- 위험 아이콘 -->
    <div v-if="showRiskIcon" class="risk-icon">
      <img :src="riskIcon" alt="위험 아이콘" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import MapComponent from "./components/MapComponent.vue";
import { getWeatherData } from "./services/WeatherService";
import { assessRisk } from "./services/RiskAssessmentService";
import { getOrCreateUUID } from "@/utils/uuid";

export default {
  components: {
    MapComponent,
  },
  data() {
    return {
      userUUID: getOrCreateUUID(),
      selectedLocation: null,
      weatherData: null,
      loading: false,
      error: null,
      monitorInterval: null,
      riskIcon: null,
      showRiskIcon: false,
      showParkingMessage: false,
    };
  },
  methods: {
    handleLocationSelect(lat, lng) {
      this.selectedLocation = { lat, lng };
      console.log("Location selected:", this.selectedLocation);
    },

    async registerParking() {
      if (!this.selectedLocation) {
        alert("위치를 선택해주세요.");
        return;
      }

      const { lat, lng } = this.selectedLocation;

      try {
        // 주차 위치 등록 API 호출
        const response = await axios.post("/api/registerParking", {
          lat,
          lon: lng,
        });

        console.log("Parking location registered:", response.data);

        // 서버에서 응답받은 데이터를 로컬에 저장
        const parkingData = response.data.parkingData;
        localStorage.setItem("parkingData", JSON.stringify(parkingData));

        alert("주차 위치가 등록되었습니다.");
      } catch (error) {
        console.error("Error registering parking location:", error);
        alert("주차 위치 등록 중 오류가 발생했습니다.");
      }
    },

    async checkRiskLevel() {
      const parkingData = JSON.parse(localStorage.getItem("parkingData"));
      if (!parkingData) {
        alert("주차 위치를 등록한 후에 위험도를 확인할 수 있습니다.");
        return;
      }

      const { lat, lng, depth_10, depth_20, depth_50, floodHistory } =
        parkingData;

      try {
        const weatherData = await getWeatherData(lat, lng);
        // eslint-disable-next-line no-unused-vars
        const { floodRiskLevel, alertMessage, riskIcon } = await assessRisk(
          weatherData.currentRain,
          weatherData.oneHourRain,
          lat,
          lng,
          depth_10,
          depth_20,
          depth_50,
          floodHistory
        );

        console.log(`Flood Risk Level: ${floodRiskLevel}`); // floodRiskLevel 사용 명시

        this.showRiskIcon = true;
        this.riskIcon = `/assets/icons/${riskIcon}`;
        setTimeout(() => (this.showRiskIcon = false), 2000);

        // floodRiskLevel을 화면에 표시
        alert(alertMessage);
      } catch (error) {
        console.error("Error checking risk level:", error);
        alert("위험도 확인 중 오류가 발생했습니다.");
      }
    },

    async startMonitoring() {
      const updateRisk = async () => {
        const parkingData = JSON.parse(localStorage.getItem("parkingData"));
        if (!parkingData) {
          console.warn("No parking data found. Monitoring stopped.");
          clearInterval(this.monitorInterval);
          this.monitorInterval = null;
          return;
        }

        const { lat, lng, depth_10, depth_20, depth_50, floodHistory } =
          parkingData;

        try {
          const weatherData = await getWeatherData(lat, lng);
          // eslint-disable-next-line no-unused-vars
          const { floodRiskLevel, alertMessage, riskIcon } = await assessRisk(
            weatherData.currentRain,
            weatherData.oneHourRain,
            lat,
            lng,
            depth_10,
            depth_20,
            depth_50,
            floodHistory
          );

          if (floodRiskLevel > 0) {
            console.log(`Detected flood risk level: ${floodRiskLevel}`);
            alert(alertMessage);
            this.showRiskIcon = true;
            this.riskIcon = `/assets/icons/${riskIcon}`;
            setTimeout(() => (this.showRiskIcon = false), 2000);
          }
        } catch (error) {
          console.error("Error during periodic risk update:", error);
        }
      };

      if (this.monitorInterval) {
        clearInterval(this.monitorInterval);
      }
      await updateRisk(); // 즉시 실행
      this.monitorInterval = setInterval(updateRisk, 3600000); // 1시간마다 실행
    },
  },
  beforeUnmount() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
  },
};
</script>

<style scoped>
/* 로고 스타일: 화면 왼쪽 상단에 고정 위치 */
.logo {
  position: fixed; /* 고정 위치 */
  top: 0px; /* 화면 상단에서 10px 떨어짐 */
  left: 5px; /* 화면 왼쪽에서 10px 떨어짐 */
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
  top: 50%; /* 화면의 세로 중앙 */
  left: 50%; /* 화면의 가로 중앙 */
  transform: translate(-50%, -50%); /* 정확한 중앙 정렬 */
  z-index: 1001; /* 다른 요소보다 위에 보이도록 설정 */
  width: 100px; /* 위험 아이콘 크기 */
  height: 100px;
}

.error {
  color: red;
}

.app-header {
  width: 100%;
}
</style>
