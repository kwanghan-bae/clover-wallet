#!/bin/bash

# 🛡️ CLOVER WALLET BACKEND PRE-COMMIT HOOK
# 이 스크립트는 커밋 전에 코드 품질과 테스트 존재 여부를 강제로 검사합니다.

echo "🔒 [Backend] Starting Pre-commit checks..."

# 1. AI Laziness Guard (플레이스홀더 감지)
echo "🔍 Checking for forbidden placeholders..."
FORBIDDEN_PATTERNS='^(\s)*// \.\.\.|^(\s)*# \.\.\.|TODO: Implement'
if git diff --cached | grep -E "$FORBIDDEN_PATTERNS"; then
    echo "❌ [ERROR] Forbidden placeholders detected! (e.g., '// ...', '# ...')"
    echo "Please implement the logic fully or remove the placeholder."
    exit 1
fi

# 2. Test Existence Check (No Test, No Code)
echo "🔍 Verifying test existence for changed files..."
CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "^clover-wallet/.*src/main/kotlin/.*\.kt$")

for FILE in $CHANGED_FILES; do
    # 파일명 추출 (e.g., UserService.kt)
    FILENAME=$(basename "$FILE")
    # 테스트 파일명 예상 (e.g., UserServiceTest.kt)
    TEST_FILENAME="${FILENAME%.*}Test.kt"
    
    # 해당 테스트 파일이 프로젝트 내에 존재하는지 검색
    if ! find clover-wallet -name "$TEST_FILENAME" | grep -q .; then
        echo "❌ [ERROR] No test found for: $FILENAME"
        echo "   You must create a test file named '$TEST_FILENAME' before committing."
        exit 1
    fi
done

# 3. Static Analysis & Test Execution
echo "🧪 Running Tests & Lint..."
cd clover-wallet

# ktlintCheck (있는 경우) 및 test 실행
if ./gradlew test --quiet; then
    echo "✅ [Backend] All checks passed!"
    exit 0
else
    echo "❌ [Backend] Tests failed. Commit aborted."
    exit 1
fi
