# CLOVER WALLET DEVELOPMENT ROADMAP

## 현재 개발 현황 (Current Status)

| 기능 분류 | 세부 기능 | 상태 | 비고 |
| :--- | :--- | :---: | :--- |
| **Core** | 하단 네비게이션 및 기본 구조 | ✅ | v1.0 |
| **Core** | NestJS 백엔드 마이그레이션 | ✅ | NestJS 11 + Prisma 7 |
| **Lotto** | 랜덤 번호 생성 (홈) | ✅ | |
| **Lotto** | 수동 번호 저장 (내 번호) | ✅ | MMKV 적용 |
| **Lotto** | 당첨 확인 API 연동 | ✅ | 백엔드 비교 로직 완료 |
| **Community** | 게시물 목록 및 작성 | ✅ | |
| **Community** | 게시물 상세/수정/삭제 | ✅ | 대댓글 포함 |
| **Intelligence** | OCR 영수증 스캔 | ✅ | ML Kit 적용 |
| **Service** | 전국 명당 데이터 API | ✅ | 백엔드 크롤링/조회 |
| **Service** | 여행 플랜 목록 조회 | ✅ | 테마별/명당별 조회 |
| **Marketing** | 뱃지 시스템 (백엔드) | ✅ | 10종 이상 자동 부여 |
| **Integrity** | 디자인 정밀 동기화 | ✅ | Flutter 원본 UI 이식 |
| **Integrity** | 안정성 강화 (Zod/EB) | ✅ | 런타임 에러 방지 |
| **Quality** | E2E 테스트 (Maestro) | ✅ | 3개 핵심 플로우 |
| **Quality** | 접근성 (a11y) | ✅ | WCAG AA 대비, 라벨/역할 |
| **Quality** | 성능 최적화 | ✅ | React.memo, 로컬 에셋 |

---

## Phase 4-2: 테스트 & 품질 고도화 (진행 중)

| 항목 | 상태 | 비고 |
| :--- | :---: | :--- |
| Maestro E2E 테스트 3개 플로우 | ✅ | 로그인, 번호생성, 게시글 |
| React.memo 리스트 최적화 | ✅ | |
| WCAG AA 색상 대비 개선 | ✅ | primary-text #2E7D32 |
| 접근성 라벨/역할 추가 | ✅ | 전체 화면 |
| 문서 현행화 (NestJS 반영) | 🏗️ | Stream 5 진행 중 |
| 80% 커버리지 CI 강제 | 📋 | 계획됨 |
| 150줄 파일 제한 가드 | 📋 | 계획됨 |

---

## 모더나이제이션 계획

| 항목 | 상태 | ADR |
| :--- | :---: | :--- |
| Turborepo 모노레포 도입 | 📋 | ADR-012 |
| @clover/shared 공유 타입 패키지 | 📋 | ADR-013 |
| 150줄 파일 크기 제한 | 📋 | ADR-014 |
| 80% 테스트 커버리지 CI | 📋 | ADR-015 |

---

## 주요 과제 (Critical Gaps)

### High Priority (사용자 경험 완성)
- [ ] 여행 플랜 상세 화면 (`TravelPlanDetailScreen`): 목록 클릭 시 상세 정보(지도, 경로) UI 구현.
- [ ] 지도 UI 연동: 백엔드의 `LottoSpot` 데이터를 실제 지도에 마커로 표시.
- [x] 디자인 정규화: Flutter 프리미엄 테마 RN 이식 완료.

### Medium Priority (고도화)
- [ ] 푸시 알림 스케줄러: 매주 토요일 20:45 당첨 발표 자동 알림 (NestJS Cron Job).
- [ ] 뱃지 UI 시각화 강화: 획득한 뱃지를 마이페이지에서 애니메이션으로 연출.
- [ ] QR 코드 스캔 통합: OCR 화면과 UX 통합 고려.

### Low Priority (출시 준비)
- [ ] EAS Build 설정 및 앱 아이콘/스플래시.
- [ ] App Store / Play Store 메타데이터 및 개인정보 처리방침.
- [ ] 번들 최적화 및 에셋 정리.

---

## 업데이트 기록
*   **2026-04-11**: Phase 4-2 진행 상태 반영, 모더나이제이션 계획 추가, NestJS 마이그레이션 반영.
*   **2025-12-23**: 코드 기반 정밀 현행화 (OCR, 여행, 뱃지 구현 확인 및 상태 변경).
*   **2025-12-07**: 커뮤니티 API 및 Provider 리팩토링 완료.
*   **2025-12-04**: 초기 코드베이스 오디트 및 Gap Analysis 작성.
