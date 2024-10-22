<template>
  <div id="app">
    <header class="app-header">
      <h3>Flood Prevention</h3>
    </header>
    <div id="map" class="map"></div>
    <div v-if="selectedLocation" class="location-info">
      <p>선택한 위치:</p>
      <p>위도: {{ selectedLocation.lat }}</p>
      <p>경도: {{ selectedLocation.lng }}</p>
      <p v-if="weatherData">현재 강수량: {{ weatherData.currentRain }}</p>
      <p v-if="weatherData">
        한 시간 뒤 강수량: {{ weatherData.oneHourRain }} mm
      </p>
      <p v-if="loading">정보를 가져오는 중...</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import { getWeatherData } from "./services/WeatherService"; // WeatherService 임포트
/* global kakao */
export default {
  data() {
    return {
      selectedLocation: null, // 선택된 위치를 저장할 변수
      map: null, // 카카오 맵 인스턴스를 저장할 변수
      weatherData: null, // 기상 정보를 저장할 변수
      marker: null, // 마커를 저장할 변수
      loading: false, // 로딩 상태 변수
      error: null, // 오류 메시지 변수
    };
  },
  mounted() {
    var mapContainer = document.getElementById("map"); // 지도를 표시할 div
    var mapOption = {
      center: new kakao.maps.LatLng(36.35144, 127.38459), // 대전 시청 좌표
      level: 3, // 확대 수준
    };

    this.map = new kakao.maps.Map(mapContainer, mapOption); // 카카오 맵 생성

    // 클릭 이벤트 추가
    kakao.maps.event.addListener(this.map, "click", async (mouseEvent) => {
      var latlng = mouseEvent.latLng; // 클릭한 위치의 좌표를 가져옵니다.
      const lat = latlng.getLat(); // 위도
      const lng = latlng.getLng(); // 경도

      // 주차 위치 등록 확인 창
      const isConfirmed = confirm(
        `주차 위치를 등록하시겠습니까?\n위도: ${lat}\n경도: ${lng}`
      );
      if (isConfirmed) {
        this.selectedLocation = {
          lat: lat, // 선택된 위도 저장
          lng: lng, // 선택된 경도 저장
        };
        this.addMarker(lat, lng); // 마커 추가
        alert("주차 위치가 등록되었습니다!"); // 등록 완료 메시지

        // 강우 정보 요청
        this.loading = true; // 로딩 시작
        this.error = null; // 오류 초기화
        this.weatherData = await getWeatherData(
          this.selectedLocation.lat,
          this.selectedLocation.lng
        );

        // 오류 처리
        if (!this.weatherData) {
          this.error = "기상 정보를 가져오는 데 실패했습니다.";
        }
        console.log("기상 데이터:", this.weatherData); // 기상 데이터 콘솔에 출력
        this.loading = false; // 로딩 종료
      }
    });
  },
  methods: {
    addMarker(lat, lng) {
      // 이전 마커가 존재하면 삭제
      if (this.marker) {
        this.marker.setMap(null); // 지도에서 마커 삭제
      }

      // 마커 아이콘 생성
      const markerImage = new kakao.maps.MarkerImage(
        "/images/front-car.png", // 업로드한 차 아이콘 경로
        new kakao.maps.Size(40, 40), // 아이콘 크기
        {
          offset: new kakao.maps.Point(20, 20), // 아이콘의 중앙을 기준으로 설정
        }
      );

      // 마커 생성
      this.marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lng), // 마커 위치 설정
        image: markerImage, // 마커 이미지 설정
      });

      // 마커를 지도에 추가
      this.marker.setMap(this.map);
    },
  },
};
</script>

<style scoped>
.map {
  width: 100vw; /* 뷰포트의 전체 너비 */
  height: 100vh; /* 뷰포트의 전체 높이 */
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
  color: red; /* 오류 메시지 색상 */
}
</style>
