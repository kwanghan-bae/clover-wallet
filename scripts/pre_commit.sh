#!/bin/bash

# SOVEREIGN GUARD PRE-COMMIT V9.0 (Turborepo Monorepo Build Integrity)
# Features: Self-exclusion, Context-Aware, Full Build Verification.

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}[Guard] Starting multi-layer quality audit...${NC}"

# 1. AI Laziness & Hallucination Guard
LAZY_RE="\/\/[[:space:]]*\.\.\.|#[[:space:]]*\.\.\.|\/\*[:space:]]*\.\.\.*\*\/|// existing code|// rest of code|// same as before|# remains unchanged|TASK: Implement|\(중략\)|\(생략\)|// 기존 로직과 동일|// 상동|// 이전과 동일"

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -v "scripts/pre_commit.sh" | grep -v "docs/init/templates/" | grep -v "docs/archive/" || true)

if [ -n "$STAGED_FILES" ]; then
    # 소스 파일에서만 나태함 검사 수행
    SOURCE_FILES_FOR_LAZY=$(echo "$STAGED_FILES" | grep -E "\.(ts|tsx|js|jsx|sh)$" || true)
    if [ -n "$SOURCE_FILES_FOR_LAZY" ]; then
        if git diff --cached -- $SOURCE_FILES_FOR_LAZY | grep "^+" | grep -Ei "$LAZY_RE" > /dev/null; then
            echo -e "${RED}[ABSOLUTE BLOCK] AI Laziness Detected in source files!${NC}"
            exit 1
        fi
    fi
fi

# 2. Path & Documentation Guard
STAGED_ALL=$(git diff --cached --name-only --diff-filter=ACM)
HAS_LOGIC=$(echo "$STAGED_ALL" | grep -E "\.(ts|tsx|js|jsx|py)$" || true)
HAS_DOCS=$(echo "$STAGED_ALL" | grep -E "(\.md|docs/)" || true)

if [ -n "$HAS_LOGIC" ] && [ -z "$HAS_DOCS" ]; then
    echo -e "${YELLOW}[DOC ADVISORY] Logic changed but NO docs updated. Please ensure documentation is in sync when possible.${NC}"
fi

# 3. Dedicated Verification
# 3.1 Frontend (Expo/React Native)
if echo "$STAGED_ALL" | grep -qE "^apps/frontend/"; then
    echo "Verifying Frontend (RN + Build Guard)..."
    cd apps/frontend

    # 1. 린트
    if npm run | grep -q "lint"; then
        npm run lint || { echo -e "${RED}ESLint failed!${NC}"; exit 1; }
    fi

    # 2. 테스트 및 숨은 에러 스캔
    TEST_LOG=$(npm test -- --watchAll=false 2>&1)
    if [ ${PIPESTATUS[0]} -ne 0 ] || echo "$TEST_LOG" | grep -Ei "ERROR:|Failed to collect coverage|SyntaxError" > /dev/null; then
        echo "$TEST_LOG"
        echo -e "${RED}[TEST FAILURE] Critical errors detected!${NC}"
        exit 1
    fi

    # 3. 실제 빌드 수행 (모듈 참조 에러 포착)
    echo "Verifying Full Build (Expo Export)..."
    if ! npx expo export --platform web --no-minify > /tmp/expo_build_log.txt 2>&1; then
        cat /tmp/expo_build_log.txt
        echo -e "${RED}[BUILD FAILURE] Expo export failed! Check for missing modules or syntax errors.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Frontend build verification passed.${NC}"

    # 4. dev 산출물 누출 검사 (warn-only)
    # 목적: 운영 번들에 dev-login 경로(EXPO_PUBLIC_DEV_AUTH_BYPASS 우회) 가
    # 의도치 않게 남아 배포되는 사고를 사전 감지.
    # 한계: 현재 pre-commit 빌드는 `--no-minify` 라 dead-code-elimination 이
    # 일어나지 않아 dev 코드가 번들에 항상 남는다. 따라서 fail 대신 warn 으로 운영.
    # 진짜 prod 배포 전에는 minified 빌드(`expo export --platform web`)로 별도 검증 필요.
    # 또한 `EXPO_PUBLIC_DEV_AUTH_BYPASS=true` 가 set 된 로컬에서는 dev-login 문자열이
    # 번들에 있는 것이 정상이므로 false-positive 회피를 위해 unset 일 때만 검사.
    if [ "${EXPO_PUBLIC_DEV_AUTH_BYPASS:-}" != "true" ] && [ -d "dist" ]; then
        if grep -rq "dev-login\|EXPO_PUBLIC_DEV_AUTH_BYPASS" dist 2>/dev/null; then
            echo -e "${YELLOW}[DEV-LEAK ADVISORY] dev-login/DEV_AUTH_BYPASS string found in dist/. Expected with --no-minify; please verify with a minified prod build before deploy.${NC}"
        else
            echo -e "${GREEN}Dev-artifact leak check passed.${NC}"
        fi
    fi

    cd ../..
fi

# 3.2 Backend (NestJS)
if echo "$STAGED_ALL" | grep -qE "^apps/backend/"; then
    echo "Verifying Backend (NestJS Build & Test)..."
    cd apps/backend

    # 1. 린트
    if npm run | grep -q "lint"; then
        npm run lint || { echo -e "${RED}ESLint failed!${NC}"; exit 1; }
    fi

    # 2. 테스트
    npm test || { echo -e "${RED}Backend tests failed!${NC}"; exit 1; }

    # 3. 빌드
    npm run build || { echo -e "${RED}Backend build failed!${NC}"; exit 1; }

    echo -e "${GREEN}Backend build verification passed.${NC}"
    cd ../..
fi

echo -e "${GREEN}[Guard] Audit successful. Total Integrity Guaranteed.${NC}"
