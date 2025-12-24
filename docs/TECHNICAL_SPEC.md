# Clover Wallet - Technical Specification (v1.0)

이 문서는 `SPEC_CATALOG.md`에서 정의한 기능을 구현하기 위한 세부 기술 명세를 정의합니다.

---

## 1. 아키텍처 개요 (Hexagonal / Layered Architecture)

### 1.1 Backend (Kotlin/Spring Boot)
- **Module Structure**: 
  - `app`: 메인 애플리케이션 및 설정
  - `api`: REST 엔드포인트 및 DTO
  - `core`: 도메인 로직 및 서비스
  - `infrastructure`: DB 접근(JPA), 외부 API(Lotto Scraping) 연동
- **Security**: Supabase JWT Secret을 이용한 커스텀 필터링 기반 인증.

### 1.2 Frontend (React Native/Expo)
- **UI Architecture**: Atomic Design Pattern (components/ui -> components/features -> app/pages).
- **Styling**: NativeWind (Tailwind CSS) + Glassmorphism Theme.
- **State Management**: React Query (Server State) + React Native MMKV (Local State).

---

## 2. 주요 기술 인터페이스 명세

### 2.1 Lotto Data Scraping
- 동행복권 사이트 혹은 공개 API를 통한 추첨 결과 수집 엔진.
- 회차별 당첨금, 당첨 번호, 명당 판매점 리스트 동기화 배치 로직.

### 2.2 OCR Engine (ML Kit)
- 로또 용지의 QR 코드 및 텍스트(회차, 번호) 인식.
- 오차 범위를 줄이기 위한 이미지 전처리 및 검증 알고리즘.

---

## 3. 데이터 인프라
- **Primary DB**: PostgreSQL (PostGIS 확장 검토 - 명당 지도 검색 최적화).
- **Cache**: 로컬 MMKV를 통한 오프라인 당첨 내역 조회 지원.