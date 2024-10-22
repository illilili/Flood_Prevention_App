<template>
  <div id="app">
    <div id="map" class="map"></div>
  </div>
</template>

<script>
/* global kakao */
export default {
  mounted() {
    var mapContainer = document.getElementById('map');
    var mapOption = {
      center: new kakao.maps.LatLng(37.5665, 126.9780),
      level: 3
    };
    
    new kakao.maps.Map(mapContainer, mapOption); // 변수를 사용하지 않고 지도 생성
  }
};
</script>

<style scoped>
.map {
  width: 40vw;  /* 뷰포트의 전체 너비 */
  height: 80vh; /* 뷰포트의 전체 높이 */
}
</style>