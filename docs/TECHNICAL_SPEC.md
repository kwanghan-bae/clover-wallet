# 🛠️ Clover Wallet Technical Specification (Unified Monorepo)

## 1. 아키텍처 개요
- **Backend**: Kotlin 1.9.23, Spring Boot 3.2.5 (Location: `/backend`)
- **Frontend**: React Native (Expo SDK 54), TypeScript (Location: `/frontend`)
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Render (Hybrid: Docker + Static Web)

## 2. 모듈 구조
- `/backend`: Multi-module Spring Boot project.
- `/frontend`: Expo-based RN project using NativeWind.

## 3. 주요 API 및 정합성

- JWT 기반 인증 (Supabase Auth 연동)

- REST API 규격 준수



## 4. 패키지 관리 및 운영 전략



- **Frontend (RN)**: Expo 54 환경에서 패키지 설치 시 발생할 수 있는 호환성 경고를 해결하기 위해 \`npm install --legacy-peer-deps\` 명령어를 사용하며, 이를 \`render.yaml\` 빌드 설정에 공식 반영함.



- **버전 고정**: React 및 React-DOM 패키지 버전을 19-2-3으로 명시하여 실행 정합성을 유지함.



- **웹 지원**: Expo Web 환경 구동을 위해 필수 패키지를 추가함.



- **타입 안정성**: MMKV의 TS2693 오류 해결을 위해 require 로딩 방식을 채택하고, Expo Notifications의 타입 누락 필드를 보강함.



- **빌드 최적화**: Render Blueprints에 \`buildFilter\`를 적용하여 backend/ 혹은 frontend/ 디렉토리 내 실제 변경이 발생한 서비스만 선별적으로 빌드하도록 최적화함.












