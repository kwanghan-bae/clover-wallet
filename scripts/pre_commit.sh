#!/bin/bash

# 🛡️ SOVEREIGN GUARD PRE-COMMIT V7.5 (Full Spectrum Integrity)
# Final Evolution: Build Guard + Hidden Error Detection + Self-Exclusion.

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔒 [Guard] Starting high-rigor quality & build audit...${NC}"

# 1. AI Laziness & Hallucination Guard (With Self-Exclusion)
P1='//'; P2=' ...'; P3='#'; P4='(중략)'
CHECK_RE="\/\/[[:space:]]*\.\.\.|#[[:space:]]*\.\.\.|\/\*[:space:]]*\.\.\.*\*\/|// existing code|// rest of code|// same as before|# remains unchanged|TODO: Implement|${P4}|\(생략\)|// 기존 로직과 동일|// 상동|// 이전과 동일"

# [LESSON] 감시 스크립트 자체는 검사 대상에서 제외하여 무한 루프를 방지합니다.
STAGED_FILES_LIST=$(git diff --cached --name-only | grep -v "scripts/pre_commit.sh" || true)

if [ -n "$STAGED_FILES_LIST" ]; then
    if git diff --cached -- $STAGED_FILES_LIST | grep "^+" | grep -Ei "$CHECK_RE" > /dev/null; then
        echo -e "${RED}❌ [ABSOLUTE BLOCK] AI Laziness Detected in NEW code!${NC}"
        git diff --cached -- $STAGED_FILES_LIST | grep "^+" | grep -Ei "$CHECK_RE"
        exit 1
    fi
fi

# 2. Path & Documentation Guard
STAGED_ALL=$(git diff --cached --name-only --diff-filter=ACM)
HAS_LOGIC=$(echo "$STAGED_ALL" | grep -E "\.(kt|dart|py|ts|tsx|cs)$" || true)
HAS_DOCS=$(echo "$STAGED_ALL" | grep -E "(\.md|docs/)" || true)

if [ -n "$HAS_LOGIC" ] && [ -z "$HAS_DOCS" ]; then
    echo -e "${RED}❌ [DOC DEBT] Logic changed but NO docs updated!${NC}"
    exit 1
fi

# 3. Language Specific Audits
# [LESSON] Exit Code 0 뒤에 숨은 에러 문자열을 정밀 스캔합니다.

# 3.1 React Native / TypeScript
if git diff --cached --name-only | grep -q "frontend/"; then
    echo "🧪 Verifying Frontend (RN + Build Guard)..."
    cd frontend
    
    # 린트 검사
    npm run lint || echo -e "${YELLOW}⚠️ Lint warnings exist.${NC}"
    
    # 테스트 및 숨은 에러 탐지
    TEST_LOG=$(npm test -- --watchAll=false 2>&1)
    if echo "$TEST_LOG" | grep -Ei "ERROR:|Failed to collect coverage|SyntaxError" > /dev/null; then
        echo "$TEST_LOG"
        echo -e "${RED}❌ [TEST FAILURE] Critical errors detected in test output!${NC}"
        exit 1
    fi

    # 빌드 시뮬레이션
    echo "🏗️  Verifying Full Build (Expo Export)..."
    npx expo export --platform web --no-minify > /dev/null 2>&1 || {
        echo -e "${RED}❌ [BUILD FAILURE] Expo export failed! Check Babel config.${NC}"
        exit 1
    }
    cd ..
fi

# 3.2 Kotlin / Gradle
if git diff --cached --name-only | grep -q "backend/"; then
    echo "🧪 Verifying Backend (Kotlin + ktlint)..."
    (cd backend && ./gradlew ktlintCheck test --quiet) || exit 1
fi

echo -e "${GREEN}✅ [Guard] Audit successful. Your intelligence is consistent.${NC}"
