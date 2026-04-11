# Stream 5: Documentation Alignment Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모든 문서를 현재 코드와 일치시키고, CLAUDE.md에 에이전트용 프로젝트 규칙을 명시하며, 새 ADR을 추가

**Architecture:** 기존 문서에서 stale 참조(Kotlin/Spring Boot)를 NestJS로 갱신. CLAUDE.md를 프로젝트 루트에 생성하여 코딩 에이전트가 따라야 할 규칙을 명시.

**Tech Stack:** Markdown

**Pre-requisite:** Stream 1 완료 (디렉토리 구조가 apps/ 기준으로 변경된 상태)

---

## Task 1: CLAUDE.md 생성 — 에이전트 프로젝트 규칙

**Files:**
- Create: `CLAUDE.md` (프로젝트 루트)

- [ ] **Step 1: CLAUDE.md 작성**

`CLAUDE.md`:

```markdown
# Clover Wallet — Agent Rules

## Project Structure
- Monorepo with Turborepo: `apps/backend`, `apps/frontend`, `packages/shared`
- Run all commands from root: `npx turbo run build|test|lint`
- Shared types: `@clover/shared` — all cross-boundary types live here

## File Rules
- **Max 150 lines** per .ts/.tsx file (excluding tests, DTOs, module files)
- If a file exceeds 150 lines, split it immediately
- One file = one responsibility

## Code Style
- Language: TypeScript (strict mode)
- Backend: NestJS modules, Prisma ORM
- Frontend: React Native + Expo Router + NativeWind
- Commit messages: conventional commits (feat/fix/refactor/test/docs/build/ci/perf/a11y)
- Korean descriptions in commit messages

## Testing Requirements
- TDD: write failing test → implement → pass → refactor
- Coverage threshold: 80%+ (enforced in CI)
- Backend tests: `apps/backend/src/**/__tests__/*.spec.ts`
- Frontend tests: `apps/frontend/__tests__/**/*.test.ts(x)`
- Run tests: `npx turbo run test`

## Shared Types (@clover/shared)
- All types shared between frontend and backend MUST be in `packages/shared/src/types/`
- Frontend api/types/* should re-export from @clover/shared
- Backend DTOs can import from @clover/shared
- When adding a new API endpoint, add types to shared first

## Build & Deploy
- Backend: `apps/backend/` → NestJS, deploys to Render
- Frontend: `apps/frontend/` → Expo, deploys to Render (static)
- CI: GitHub Actions runs `turbo run lint test build`
- Pre-commit: `scripts/pre_commit.sh` runs lint + test + build

## Don'ts
- Don't add features during refactoring — behavior must not change
- Don't skip tests — every new module needs tests
- Don't use `any` without justification
- Don't import between apps directly — use @clover/shared
- Don't commit .env files or credentials
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md 에이전트 프로젝트 규칙 생성"
```

---

## Task 2: TECHNICAL_SPEC.md 갱신 — Kotlin → NestJS

**Files:**
- Modify: `docs/TECHNICAL_SPEC.md`

- [ ] **Step 1: TECHNICAL_SPEC.md 읽기**

현재 내용을 읽고 Kotlin/Spring Boot 참조를 모두 찾기.

- [ ] **Step 2: 백엔드 섹션을 NestJS로 전면 갱신**

변경할 내용:
- "Kotlin/Spring Boot" → "TypeScript/NestJS 11"
- "Gradle" → "npm"
- "JPA" → "Prisma ORM"
- 아키텍처 다이어그램에서 백엔드 레이어를 NestJS 모듈 구조로 업데이트
- 디렉토리 구조를 `apps/backend/src/` 기준으로 갱신
- 테스트 프레임워크를 JUnit → Jest로 갱신

- [ ] **Step 3: Turborepo 모노레포 구조 반영**

프로젝트 구조 섹션에 Turborepo + workspaces + shared 패키지 설명 추가.

- [ ] **Step 4: Commit**

```bash
git add docs/TECHNICAL_SPEC.md
git commit -m "docs: TECHNICAL_SPEC.md를 NestJS + Turborepo 현행화"
```

---

## Task 3: docs/README.md 갱신

**Files:**
- Modify: `docs/README.md`

- [ ] **Step 1: README.md를 현재 아키텍처에 맞게 업데이트**

- 프로젝트 구조: apps/backend, apps/frontend, packages/shared
- 기술 스택: NestJS 11, Expo SDK 54, Turborepo
- 설치 방법: root에서 `npm install` → `npx turbo run build`
- 개발 실행: `npx turbo run dev:backend`, `npx turbo run dev:frontend`
- 테스트: `npx turbo run test`
- Kotlin/Spring Boot 참조 제거

- [ ] **Step 2: Commit**

```bash
git add docs/README.md
git commit -m "docs: README.md를 Turborepo 모노레포 구조로 현행화"
```

---

## Task 4: ADR 추가 — 고도화 결정 기록

**Files:**
- Modify: `docs/ADR.md`

- [ ] **Step 1: 새 ADR 4개 추가**

`docs/ADR.md`에 추가:

```markdown
## ADR-012: Turborepo 모노레포 도구 도입

**상태:** 승인 (2026-04-11)
**맥락:** backend-node, frontend가 독립적으로 관리되어 공유 타입 없이 각각 API 타입을 정의하고 있었음.
**결정:** Turborepo + npm workspaces로 모노레포 구성. apps/backend, apps/frontend, packages/shared 3개 워크스페이스.
**결과:** 빌드 캐싱으로 CI 속도 향상. 공유 타입으로 프론트/백 타입 불일치 방지.

## ADR-013: @clover/shared 공유 타입 패키지

**상태:** 승인 (2026-04-11)
**맥락:** 프론트엔드 api/types/와 백엔드 dto/ 간 타입이 독립적으로 정의되어 불일치 위험.
**결정:** packages/shared에 Prisma 스키마 기반 공유 타입 정의. 양쪽에서 @clover/shared로 import.
**결과:** 단일 타입 소스. API 계약 변경 시 양쪽에서 컴파일 에러로 감지.

## ADR-014: 150줄 파일 크기 제한 규칙

**상태:** 승인 (2026-04-11)
**맥락:** community.service.ts (342줄), mypage.tsx (229줄) 등 대형 파일이 AI 에이전트의 컨텍스트 윈도우 활용과 정확한 편집을 방해.
**결정:** 모든 .ts/.tsx 파일은 150줄 이하. 테스트, DTO, module 파일은 예외. 초과 시 즉시 분리.
**결과:** 에이전트가 파일 전체를 읽고 수정 가능. 책임 분리 강제.

## ADR-015: 80% 테스트 커버리지 CI 강제

**상태:** 승인 (2026-04-11)
**맥락:** 192(백) + 71(프론트) 테스트가 있지만 커버리지 비율이 측정/강제되지 않음.
**결정:** Jest coverageThreshold에 global 80% 설정. CI에서 미달 시 빌드 실패.
**결과:** 코드 품질 보장. 새 코드에 반드시 테스트 동반.
```

- [ ] **Step 2: Commit**

```bash
git add docs/ADR.md
git commit -m "docs: ADR-012~015 고도화 결정 기록 추가"
```

---

## Task 5: ROADMAP.md 업데이트

**Files:**
- Modify: `docs/ROADMAP.md`

- [ ] **Step 1: 완료 항목 업데이트**

Phase 4-2 항목을 진행중/완료로 갱신. 고도화 작업(Turborepo, 모듈화, 커버리지) 기록.

- [ ] **Step 2: Commit**

```bash
git add docs/ROADMAP.md
git commit -m "docs: ROADMAP.md 고도화 진행 상태 업데이트"
```

---

## Task 6: 세션 로그 정리

**Files:**
- 기존 세션 로그 확인 및 필요시 아카이브

- [ ] **Step 1: stale 세션 로그 확인**

Kotlin 관련 세션 로그가 있으면 상단에 "ARCHIVED — 백엔드가 NestJS로 마이그레이션됨" 표시.

- [ ] **Step 2: Commit**

```bash
git add docs/sessions/
git commit -m "docs: stale 세션 로그 아카이브 표시"
```

---

## Task 7: 최종 검증

- [ ] **Step 1: Kotlin/Spring Boot/Gradle 참조 검색**

Run: `grep -ri "kotlin\|spring boot\|gradle\|bootJar\|ktlint" docs/ CLAUDE.md scripts/ --include="*.md" --include="*.sh" | grep -v "ARCHIVED\|마이그레이션\|이전"`
Expected: 0건 (모두 갱신 또는 아카이브됨)

- [ ] **Step 2: CLAUDE.md 내용이 실제 구조와 일치하는지 확인**

디렉토리 구조, 명령어, 패키지 이름이 실제와 일치하는지 검증.

- [ ] **Step 3: 최종 커밋**

```bash
git add -A
git commit -m "docs: Stream 5 완료 — 모든 문서 현행화, CLAUDE.md, ADR 추가"
```
