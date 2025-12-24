#!/bin/bash

# 🛡️ SOVEREIGN GUARD PRE-COMMIT V8.4 (Absolute Build Integrity)
# Features: Self-exclusion, Context-Aware, Full Build Verification.

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔒 [Guard] Starting absolute multi-layer quality audit...${NC}"

# 1. AI Laziness & Hallucination Guard
LAZY_RE="\/\/[[:space:]]*\.\.\.|#[[:space:]]*\.\.\.|\/\*[:space:]]*\.\.\.*\*\/|// existing code|// rest of code|// same as before|# remains unchanged|TODO: Implement|\(중략\)|\(생략\)|// 기존 로직과 동일|// 상동|// 이전과 동일"
CODE_BAD_RE="@org\.springframework|kotlinx\.coroutines|@java\.util|@org\.apache|@com\.google"

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | grep -v "scripts/pre_commit.sh" | grep -v "docs/init/templates/" | grep -v "docs/archive/" || true)

if [ -n "$STAGED_FILES" ]; then
    # 소스 파일에서만 나태함 검사 수행
    SOURCE_FILES_FOR_LAZY=$(echo "$STAGED_FILES" | grep -E "\.(kt|java|ts|tsx|dart|cs|py|sh)$" || true)
    if [ -n "$SOURCE_FILES_FOR_LAZY" ]; then
        if git diff --cached -- $SOURCE_FILES_FOR_LAZY | grep "^+" | grep -Ei "$LAZY_RE" > /dev/null; then
            echo -e "${RED}❌ [ABSOLUTE BLOCK] AI Laziness Detected in source files!${NC}"
            exit 1
        fi
    fi

    SOURCE_FILES=$(echo "$STAGED_FILES" | grep -E "\.(kt|java|ts|tsx|dart|cs)$" || true)
    if [ -n "$SOURCE_FILES" ]; then
        if git diff --cached $SOURCE_FILES | grep "^+" | grep -v "^+import " | grep -Ei "$CODE_BAD_RE" > /dev/null; then
            echo -e "${RED}❌ [CODE STANDARD VIOLATION] Lazy full-package call detected!${NC}"
            exit 1
        fi
    fi
fi

# 2. Path & Documentation Guard
STAGED_ALL=$(git diff --cached --name-only --diff-filter=ACM)
HAS_LOGIC=$(echo "$STAGED_ALL" | grep -E "\.(kt|java|ts|tsx|dart|cs|py)$" || true)
HAS_DOCS=$(echo "$STAGED_ALL" | grep -E "(\.md|docs/)" || true)

if [ -n "$HAS_LOGIC" ] && [ -z "$HAS_DOCS" ]; then
    echo -e "${YELLOW}⚠️ [DOC ADVISORY] Logic changed but NO docs updated. Please ensure documentation is in sync when possible.${NC}"
    # exit 1 (지나치게 엄격한 차단을 경고로 완화)
fi

# 3. Dedicated Verification
# 3.1 React Native (Build & Test)
if echo "$STAGED_ALL" | grep -q "frontend/"; then
    echo "🧪 Verifying Frontend (RN + Absolute Build Guard)..."
    cd frontend
    
    # 1. 린트
    if npm run | grep -q "lint"; then
        npm run lint || { echo -e "${RED}❌ ESLint failed!${NC}"; exit 1; }
    fi
    
    # 2. 테스트 및 숨은 에러 스캔
    TEST_LOG=$(npm test -- --watchAll=false 2>&1)
    if [ ${PIPESTATUS[0]} -ne 0 ] || echo "$TEST_LOG" | grep -Ei "ERROR:|Failed to collect coverage|SyntaxError" > /dev/null; then
        echo "$TEST_LOG"
        echo -e "${RED}❌ [TEST FAILURE] Critical errors detected!${NC}"
        exit 1
    fi

    # 3. [핵심] 실제 빌드 수행 (모듈 참조 에러 포착)
    echo "🏗️  Verifying Full Build (Expo Export)..."
    if ! npx expo export --platform web --no-minify > /tmp/expo_build_log.txt 2>&1; then
        cat /tmp/expo_build_log.txt
        echo -e "${RED}❌ [BUILD FAILURE] Expo export failed! Check for missing modules or syntax errors.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Build verification passed.${NC}"
    cd ..
fi

# 3.2 Kotlin
if echo "$STAGED_ALL" | grep -E "(\.kt|\.java)$" | grep -q "backend/"; then
    echo "🧪 Verifying JVM Backend (Full Build & Test)..."
    # bootJar를 포함한 전체 빌드 수행 (테스트는 별도 수행으로 병렬성 확보 가능하나 여기선 안전하게 통합)
    (cd backend && ./gradlew ktlintCheck :app:api:bootJar test --quiet) || { echo -e "${RED}❌ Backend build failed!${NC}"; exit 1; }
fi

echo -e "${GREEN}✅ [Guard] Audit successful. Total Integrity Guaranteed.${NC}"