# flood-prevention-Front

## 차량 침수 예방 시스템(Flood Guard)
사용자 위치 기반 실시간 강수량 및 침수 이력 데이터를 활용하여, 차량이 주차된 위치의 침수 위험을 머신러닝 기반으로 예측하고 알림을 제공하는 웹 어플리케이션 서비스입니다. 기상청 단기예보 API와 과거 침수 이력을 결합해 위험 등급을 분류/예측 모델로 계산하며, 등록된 차량 위치에 따라 실시간 위험 알림을 받을 수 있습니다.

### 주요 기능
사용자의 위치 기반 차량 주차 위치 등록 및 지도 시각화

현재 강수량 + 1시간 후 예보를 활용한 침수 위험 등급 예측

과거 침수 이력 및 임계값 데이터를 활용한 머신러닝 기반 위험 분류

Firebase 푸시 알림을 통한 실시간 위험 알림 전송

### 기술 스택
Back-End: Node.js, Express, FastAPI

Database: PostgreSQL, Sequelize

Front-End: Vue.js, OpenLayers

Infra/Service: Render, Firebase

API: 기상청 단기예보 API
