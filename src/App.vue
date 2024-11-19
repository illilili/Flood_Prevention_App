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
import MapComponent from "./components/MapComponent.vue";
import { getWeatherData } from "./services/WeatherService";
import { checkFloodHistory } from "./services/FloodHistoryService";
import { assessRisk } from "./services/RiskAssessmentService";
import { getOrCreateUUID } from "@/utils/uuid";

export default {
  components: {
    MapComponent,
  },
  data() {
    return {
      userUUID: null,
      selectedLocation: null,
      weatherData: null,
      loading: false,
      error: null,
      monitorInterval: null, // 모니터링 타이머
      riskIcon: null,
      showRiskIcon: false, // 위험 아이콘 표시 여부
      showParkingMessage: false,
    };
  },

  created() {
    this.userUUID = getOrCreateUUID();
    console.log("User UUID:", this.userUUID); // 서버와 통신 시 사용
  },

  methods: {
    registerParking() {
      this.showParkingMessage = true;
      setTimeout(() => {
        this.showParkingMessage = false;
      }, 2000);
    },

    async checkRiskLevel() {
      // 위험도 확인 버튼 클릭 시 실행
      console.log("위험도 확인 버튼 클릭됨");
      if (this.selectedLocation) {
        const { lat, lng } = this.selectedLocation;

        // 위험도 평가
        await this.checkAndAlert(lat, lng);
      } else {
        alert("위치가 선택되지 않았습니다.");
      }
    },

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
            alert("이 위치는 침수 이력이 있습니다.");
          } else {
            alert("이 위치는 침수 이력이 없습니다.");
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

        // 위험도 아이콘 업데이트
        if (riskMessage.includes("위험")) {
          this.riskIcon = require("@/assets/danger-icon.png"); // 위험 아이콘
        } else if (riskMessage.includes("경고")) {
          this.riskIcon = require("@/assets/warning-icon.png"); // 경고 아이콘
        } else {
          this.riskIcon = require("@/assets/safe-icon.png"); // 안전 지역 아이콘
        }
        this.showRiskIcon = true;

        // 아이콘 표시 시간 (2초 뒤 사라짐)
        setTimeout(() => {
          this.showRiskIcon = false;
        }, 2000);
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
