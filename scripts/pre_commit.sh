#!/bin/bash

# 🛡️ CLOVER WALLET MONOREPO GUARD (v6.3)
# Precise linting for Backend (Kotlin) and Frontend (RN/TS).

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔒 [Monorepo Guard] Auditing Backend & Frontend specific rules...${NC}"

# 1. AI Laziness Guard
# 오탐 방지: 실제 생략을 의미하는 '주석+공백+점3개' 패턴을 엄격히 탐지합니다.
CHECK_RE="\/\/[[:space:]]*\.\.\.|#[[:space:]]*\.\.\.|\/\*[:space:]]*\.\.\.*\*\/|// existing code|// rest of code|// same as before|# remains unchanged|TODO: Implement|\(중략\)|\(생략\)|// 기존 로직과 동일|// 상동|// 이전과 동일"

# 오탐 방지: 검사 스크립트 자체는 제외하고 새로 추가된 줄(+)에서만 나태함 패턴을 찾습니다.
STAGED_FILES_TO_CHECK=$(git diff --cached --name-only | grep -v "scripts/pre_commit.sh" || true)

if [ -n "$STAGED_FILES_TO_CHECK" ]; then
    if git diff --cached -- $STAGED_FILES_TO_CHECK | grep "^+" | grep -Ei "$CHECK_RE" > /dev/null; then
        echo -e "${RED}❌ [ABSOLUTE BLOCK] AI Laziness Detected in NEW code!${NC}"
        git diff --cached -- $STAGED_FILES_TO_CHECK | grep "^+" | grep -Ei "$CHECK_RE"
        exit 1
    fi
fi

# 2. Path-based Test & Doc Enforcement
STAGED_ALL=$(git diff --cached --name-only --diff-filter=ACM)
BACKEND_CHANGED=false
FRONTEND_CHANGED=false
DOCS_CHANGED=false

for FILE in $STAGED_ALL; do
    if [[ $FILE == backend/* ]]; then BACKEND_CHANGED=true; fi
    if [[ $FILE == frontend/* ]]; then FRONTEND_CHANGED=true; fi
    if [[ $FILE == docs/* ]] || [[ $FILE == *.md ]]; then DOCS_CHANGED=true; fi
done

# 3. Documentation Debt Check
if ([ "$BACKEND_CHANGED" = true ] || [ "$FRONTEND_CHANGED" = true ]) && [ "$DOCS_CHANGED" = false ]; then
    echo -e "${RED}❌ [DOC DEBT] Code changed in backend/frontend but NO docs updated!${NC}"
    exit 1
fi

# 4. Dedicated Validation
# 4.1 Backend (Kotlin + ktlint)
if [ "$BACKEND_CHANGED" = true ]; then
    echo "🧪 Verifying Backend (Kotlin + ktlint)..."
    (cd backend && ./gradlew ktlintCheck test --quiet) || exit 1
fi

# 4.2 Frontend (RN + TS + ESLint)
if [ "$FRONTEND_CHANGED" = true ]; then
    echo "🧪 Verifying Frontend (React Native)..."
    cd frontend
    
    # Lint (도구가 있는 경우에만 실행)
    if command -v npm &> /dev/null && npm run | grep -q "lint"; then
        echo "🔍 Running Lint..."
        npm run lint || echo -e "${YELLOW}⚠️ Lint failed, but proceeding...${NC}"
    else
        echo -e "${YELLOW}⚠️ No lint script found, skipping...${NC}"
    fi
    
    # Test
    if command -v npm &> /dev/null; then
        echo "🧪 Running Jest Tests..."
        npm test -- --watchAll=false || exit 1
    fi
    cd ..
fi

echo -e "${GREEN}✅ [Monorepo Guard] All systems go. Proceeding with commit.${NC}"