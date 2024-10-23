import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";

// 침수 이력도 레이어를 추가하는 함수
export function addFloodLayer(map) {
  // 현재 뷰의 범위로 BBOX 값 설정
  const size = map.getSize();
  const bbox = map.getView().calculateExtent(size); // 지도의 현재 범위 계산
  const width = size[0]; // 지도의 너비
  const height = size[1]; // 지도의 높이

  const floodLayer = new TileLayer({
    source: new TileWMS({
      url: "/safemap/apis.do", // WMS 서비스 URL
      params: {
        REQUEST: "GetMap",
        SERVICE: "WMS",
        VERSION: "1.3.0",
        FORMAT: "image/png",
        TRANSPARENT: true,
        LAYERS: "A2SM_FLUDMARKS", // 침수 이력도 레이어 이름
        BBOX: bbox.join(","), // BBOX 값 설정
        WIDTH: width, // 지도의 너비
        HEIGHT: height, // 지도의 높이
        CRS: "EPSG:3857", // 좌표계 설정 (WGS84 Web Mercator)
        apikey: "89B1UZBS-89B1-89B1-89B1-89B1UZBSFR", // API 키
      },
      serverType: "geoserver", // WMS 서버 유형
      crossOrigin: "anonymous", // CORS 해결
    }),
  });

  // 지도에 침수 이력도 레이어 추가
  map.addLayer(floodLayer);
}
