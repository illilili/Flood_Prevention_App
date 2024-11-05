<template>
  <div id="map" class="map"></div>
</template>

<script>
/* global kakao */
export default {
  name: "MapComponent",
  props: {
    locationSelect: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      map: null,
      marker: null, // 마커를 저장할 변수 추가
    };
  },
  mounted() {
    // 현재 위치 설정 및 지도 생성
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(lat, lng), // 현재 위치로 설정
        level: 3, // 확대 수준
      };

      this.map = new kakao.maps.Map(mapContainer, mapOption);

      // 지도 클릭 이벤트
      kakao.maps.event.addListener(this.map, "click", (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        const lat = latlng.getLat();
        const lng = latlng.getLng();

        this.locationSelect(lat, lng); // 부모 컴포넌트로 위치 전송
        this.addMarker(lat, lng); // 마커 추가
      });
    });
  },
  methods: {
    addMarker(lat, lng) {
      // 이전 마커가 존재하면 삭제
      if (this.marker) {
        this.marker.setMap(null);
      }

      // 마커 아이콘 설정
      const markerImage = new kakao.maps.MarkerImage(
        "/images/front-car.png", // 마커 이미지 경로
        new kakao.maps.Size(40, 40),
        {
          offset: new kakao.maps.Point(20, 20),
        }
      );

      // 마커 생성 및 지도에 추가
      this.marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lng),
        image: markerImage,
      });

      this.marker.setMap(this.map); // 지도에 마커 설정
    },
  },
};
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
