/* global kakao */

// 마커 추가 함수 정의
export function addMarker(map, lat, lng) {
  // 기존 마커를 삭제하기 위해 마커를 전역으로 관리
  let marker = null;

  // 이전 마커가 존재하면 삭제
  if (marker) {
    marker.setMap(null); // 지도에서 마커 삭제
  }

  // 마커 아이콘 생성
  const markerImage = new kakao.maps.MarkerImage(
    "/images/front-car.png", // 차 아이콘 경로
    new kakao.maps.Size(40, 40), // 아이콘 크기
    {
      offset: new kakao.maps.Point(20, 20), // 아이콘의 중앙을 기준으로 설정
    }
  );

  // 마커 생성
  marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(lat, lng), // 마커 위치 설정
    image: markerImage, // 마커 이미지 설정
  });

  // 마커를 지도에 추가
  marker.setMap(map);
}
