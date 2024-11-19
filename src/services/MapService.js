/* global kakao */

// 기존 마커 관리
let markers = [];

export function addMarker(map, lat, lng) {
  // 모든 기존 마커 삭제
  markers.forEach((marker) => marker.setMap(null));
  markers = [];

  // 새 마커 생성
  const markerImage = new kakao.maps.MarkerImage(
    "/images/front-car.png",
    new kakao.maps.Size(40, 40),
    { offset: new kakao.maps.Point(20, 20) }
  );

  const marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(lat, lng),
    image: markerImage,
  });

  marker.setMap(map);
  markers.push(marker);
}
