#!/bin/bash

# 🛡️ CLOVER WALLET MONOREPO GUARD (v7.7)
# Context-Aware Intelligence: Differentiates between Docs and Code.

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔒 [Guard] Starting context-aware quality audit...${NC}"

# 1. AI Laziness & Hallucination Guard
P1='//'; P2=' ...'; P3='#'; P4='(중략)'
# 모든 파일에서 금지되는 나태함 패턴 (주로 생략 기호)
LAZY_RE="${P1}${P2}|${P3}${P2}|\/\* ${P2} \*\/|// existing code|// rest of code|// same as before|# remains unchanged|TODO: Implement|${P4}|\(생략\)|// 기존 로직과 동일|// 상동|// 이전과 동일"
# 오직 코드(.kt, .ts, .dart)에서만 금지되는 패턴
CODE_BAD_RE="@org\.springframework"

# 검사 대상 파일 목록 (스크립트 자체 제외)
STAGED_FILES=$(git diff --cached --name-only | grep -v "scripts/pre_commit.sh" || true)

if [ -n "$STAGED_FILES" ]; then
    # 1.1 전역 나태함 검사 (모든 파일 대상)
    if git diff --cached $STAGED_FILES | grep "^+" | grep -Ei "$LAZY_RE" > /dev/null; then
        echo -e "${RED}❌ [ABSOLUTE BLOCK] AI Laziness Detected in NEW code!${NC}"
        git diff --cached $STAGED_FILES | grep "^+" | grep -Ei "$LAZY_RE"
        exit 1
    fi

    # 1.2 코드 전용 패턴 검사 (소스 코드 파일만 대상)
    SOURCE_FILES=$(echo "$STAGED_FILES" | grep -E "\.(kt|ts|tsx|dart)$" || true)
    if [ -n "$SOURCE_FILES" ]; then
        if git diff --cached $SOURCE_FILES | grep "^+" | grep -Ei "$CODE_BAD_RE" > /dev/null; then
            echo -e "${RED}❌ [CODE STANDARD VIOLATION] Full package annotation detected in source code!${NC}"
            echo "   Please use proper imports instead of full package paths."
            git diff --cached $SOURCE_FILES | grep "^+" | grep -Ei "$CODE_BAD_RE"
            exit 1
        fi
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

# 4.2 Frontend (RN + TS + Build Guard)
if [ "$FRONTEND_CHANGED" = true ]; then
    echo "🧪 Verifying Frontend (React Native + Build Guard)..."
    cd frontend
    npm test -- --watchAll=false || exit 1
    # npx expo export --platform web (환경에 따라 선택적 실행)
    cd ..
fi

echo -e "${GREEN}✅ [Monorepo Guard] Audit passed. Docs and Code are appropriately handled.${NC}"