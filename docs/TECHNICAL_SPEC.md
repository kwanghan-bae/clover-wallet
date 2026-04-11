# Clover Wallet - Technical Specification (v2.0)

이 문서는 `SPEC_CATALOG.md`에서 정의한 기능을 구현하기 위한 세부 기술 명세를 정의합니다.

---

## 1. 아키텍처 개요 (Modular / Layered Architecture)

### 1.1 Backend (NestJS 11 / TypeScript)
- **Module Structure**:
  - `src/app.module.ts`: 루트 모듈 및 전역 설정
  - `src/{domain}/`: 도메인별 모듈 (auth, lotto, community, ticket, travel 등)
  - 각 도메인: `module > controller > service` 구조
- **ORM**: Prisma 7 (PostgreSQL)
- **Security**: Supabase JWT Secret 기반 NestJS Guard 인증.
- **Validation**: class-validator + class-transformer DTO 검증.

### 1.2 Frontend (React Native/Expo)
- **UI Architecture**: Atomic Design Pattern (components/ui -> components/features -> app/pages).
- **Styling**: NativeWind (Tailwind CSS) + Glassmorphism Theme.
- **State Management**: React Query (Server State) + React Native MMKV (Local State).

---

## 2. 주요 기술 인터페이스 명세

### 2.1 Lotto Data Scraping
- 동행복권 사이트 혹은 공개 API를 통한 추첨 결과 수집 엔진.
- 회차별 당첨금, 당첨 번호, 명당 판매점 리스트 동기화 배치 로직.
- NestJS `@nestjs/schedule` Cron Job으로 자동 동기화.

### 2.2 OCR Engine (ML Kit)
- 로또 용지의 QR 코드 및 텍스트(회차, 번호) 인식.
- 오차 범위를 줄이기 위한 이미지 전처리 및 검증 알고리즘.

---

## 3. 데이터 인프라
- **Primary DB**: PostgreSQL (Supabase 호스팅).
- **ORM**: Prisma 7 (스키마 기반 마이그레이션, 타입 안전 쿼리).
- **Cache**: 로컬 MMKV를 통한 오프라인 당첨 내역 조회 지원.

---

## 4. 세부 기능 기술 명세

### 4.1 로또 명당 상세 (Spot Detail)
- **API**: `GET /api/v1/lotto-spots/{spotId}/history`
  - 해당 판매점의 역대 당첨 이력을 조회.
  - 응답 데이터: 회차, 등수, 당첨일, 당첨금(선택적).
- **UI Components**:
  - `GlassCard` 기반의 정보 요약 섹션 (이름, 주소, 누적 당첨 횟수).
  - 당첨 이력을 보여주는 `FlatList` 또는 타임라인 뷰.
  - 상단 투명 헤더 및 명당 이미지(Placeholder) 적용.
- **Data Handling**:
  - `react-query`를 통한 데이터 페칭 및 캐싱.
  - 로딩 상태 시 Skeleton Screen 제공.

---

## 5. 프로젝트 디렉토리 구조

```
clover-wallet/
  backend-node/          # NestJS 11 API 서버
    src/
      auth/              # 인증 모듈 (Supabase JWT)
      lotto/             # 로또 번호 생성/조회
      lotto-spot/        # 명당 판매점
      community/         # 커뮤니티 게시판
      ticket/            # 티켓 스캔/관리
      travel/            # 여행 플랜
      admin/             # 관리자 데이터 초기화
      prisma/            # Prisma 서비스
    prisma/
      schema.prisma      # DB 스키마 정의
    test/                # E2E 테스트
  frontend/              # Expo 54 + React Native 앱
    app/                 # Expo Router 페이지
    components/          # UI/Feature 컴포넌트
    api/                 # API 클라이언트
    hooks/               # 커스텀 훅
    utils/               # 유틸리티
    __tests__/           # Jest 테스트
  docs/                  # 프로젝트 문서
  scripts/               # 빌드 가드 스크립트
```

---

## 6. 테스트 전략

- **Backend**: Jest 단위/통합 테스트 (~192 tests)
- **Frontend**: Jest + React Native Testing Library (71 tests)
- **E2E**: Maestro (핵심 플로우 3개: 로그인, 번호생성, 게시글)
- **커버리지 목표**: 80% 이상
- **CI**: GitHub Actions (lint + test + build)
