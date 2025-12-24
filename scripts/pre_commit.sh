#!/bin/bash

# 🛡️ CLOVER WALLET MONOREPO GUARD (v6.1)
# Enforces integrity for both Backend (Kotlin) and Frontend (RN/Expo).

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔒 [Monorepo Guard] Auditing unified system...${NC}"

# 1. AI Laziness & Hallucination Guard
P1='//'
P2=' ...'
P3='#'
P4='(중략)'
JOINED_PATTERNS="${P1}${P2}|${P3}${P2}|\/\* ${P2} \*\/|// existing code|// rest of code|// same as before|# remains unchanged|TODO: Implement|${P4}|\(생략\)|// 기존 로직과 동일|// 상동|// 이전과 동일"

if git diff --cached | grep -Ei "$JOINED_PATTERNS"; then
    echo -e "${RED}❌ [ABSOLUTE BLOCK] AI Laziness Detected!${NC}"
    exit 1
fi

# 2. Path-based Test & Doc Enforcement
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM)
BACKEND_CHANGED=false
FRONTEND_CHANGED=false
DOCS_CHANGED=false

for FILE in $STAGED_FILES; do
    if [[ $FILE == backend/* ]]; then BACKEND_CHANGED=true; fi
    if [[ $FILE == frontend/* ]]; then FRONTEND_CHANGED=true; fi
    if [[ $FILE == docs/* ]] || [[ $FILE == *.md ]]; then DOCS_CHANGED=true; fi
done

# 3. Documentation Debt Check
if ([ "$BACKEND_CHANGED" = true ] || [ "$FRONTEND_CHANGED" = true ]) && [ "$DOCS_CHANGED" = false ]; then
    echo -e "${RED}❌ [DOC DEBT] Code changed in backend/frontend but NO docs updated!${NC}"
    exit 1
fi

# 4. Project Specific Execution
# 4.1 Backend Verification
if [ "$BACKEND_CHANGED" = true ]; then
    echo "🧪 Verifying Backend (Kotlin)..."
    (cd backend && ./gradlew ktlintCheck test --quiet) || exit 1
fi

# 4.2 Frontend Verification
if [ "$FRONTEND_CHANGED" = true ]; then
    echo "🧪 Verifying Frontend (React Native)..."
    # RN 특화 검증 (lint 및 jest)
    (cd frontend && npm run lint && npm test -- --watchAll=false) || exit 1
fi

echo -e "${GREEN}✅ [Monorepo Guard] All systems go. Proceeding with atomic commit.${NC}"