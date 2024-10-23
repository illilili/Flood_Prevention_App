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
import "ol/ol.css"; // OpenLayers 스타일 임포트
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat } from "ol/proj";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import Geolocation from "ol/Geolocation"; // 현재 위치를 가져오기 위한 Geolocation
import { addFloodLayer } from "./services/FloodHistory"; // 침수 이력 레이어 추가 함수 임포트
import { getWeatherData } from "./services/WeatherService"; // 강수량 정보 가져오는 서비스

export default {
  data() {
    return {
      map: null, // OpenLayers 맵 인스턴스
      selectedLocation: null, // 선택된 위치 저장
      vectorSource: null, // 마커 레이어 소스
      weatherData: null, // 강수량 정보 저장
      loading: false, // 로딩 상태
      error: null, // 에러 상태
    };
  },
  mounted() {
    // OpenStreetMap을 이용한 기본 지도 설정
    const tileLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png", // OpenStreetMap 타일 지도
      }),
    });

    // 마커를 담을 벡터 소스
    this.vectorSource = new VectorSource();

    // 벡터 레이어 (마커 추가를 위한 레이어)
    const markerLayer = new VectorLayer({
      source: this.vectorSource,
    });

    // OpenLayers 지도 설정
    this.map = new Map({
      target: "map", // 지도를 표시할 HTML 요소의 ID
      layers: [tileLayer, markerLayer], // 지도와 마커 레이어 추가
      view: new View({
        center: fromLonLat([127.38459, 36.35144]), // 기본 중심 좌표 (대전 시청)
        zoom: 17, // 줌 레벨 설정
      }),
    });

    // 침수 이력도 레이어 추가
    addFloodLayer(this.map);

    // 현재 위치를 가져오기 위한 Geolocation 객체 생성
    const geolocation = new Geolocation({
      tracking: true, // 위치 추적 활성화
      projection: this.map.getView().getProjection(),
    });

    // 사용자의 위치가 업데이트되면 지도 중심을 설정
    geolocation.on("change", () => {
      const coordinates = geolocation.getPosition();
      if (coordinates) {
        this.map.getView().setCenter(coordinates); // 현재 위치를 지도 중심으로 설정
        this.map.getView().setZoom(17); // 줌 레벨 설정
      }
    });

    // 지도 클릭 이벤트 (주차 위치 등록)
    this.map.on("click", async (evt) => {
      const lonLat = this.map.getCoordinateFromPixel(evt.pixel);
      const lat = lonLat[1];
      const lng = lonLat[0];

      const isConfirmed = confirm(
        `주차 위치를 등록하시겠습니까?\n위도: ${lat}\n경도: ${lng}`
      );
      if (isConfirmed) {
        this.selectedLocation = {
          lat: lat,
          lng: lng,
        };
        this.addMarker(lonLat); // 마커 추가

        // 강수량 정보 가져오기
        this.fetchWeatherData(lat, lng);
      }
    });
  },
  methods: {
    // 클릭한 위치에 마커 추가
    addMarker(lonLat) {
      // 이전 마커 제거
      this.vectorSource.clear();

      // 마커 추가
      const marker = new Feature({
        geometry: new Point(lonLat),
      });

      // 마커 스타일 설정 (차량 아이콘)
      marker.setStyle(
        new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: "/images/front-car.png", // 차량 아이콘 경로
            scale: 0.1, // 아이콘 크기
          }),
        })
      );

      // 마커를 벡터 소스에 추가
      this.vectorSource.addFeature(marker);
    },

    // 강수량 정보를 가져오는 함수
    async fetchWeatherData(lat, lng) {
      this.loading = true;
      this.error = null;
      try {
        this.weatherData = await getWeatherData(lat, lng);
      } catch (error) {
        this.error = "기상 정보를 가져오는 데 실패했습니다.";
      } finally {
        this.loading = false;
      }
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
.loading {
  color: blue;
}

.legend {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>
