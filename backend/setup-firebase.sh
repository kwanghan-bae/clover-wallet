#!/bin/bash

# Firebase Admin SDK 환경 변수 설정
export FIREBASE_SERVICE_ACCOUNT_JSON=$(cat firebase-keys/service-account.json)

echo "✅ Firebase 환경 변수 설정 완료"
echo "이제 서버를 시작할 수 있습니다:"
echo "  ./gradlew :app:api:bootRun"
