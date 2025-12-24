#!/bin/bash
set -e

echo "🚀 Clover Wallet 빠른 배포 스크립트"
echo "=================================="

# 배포 모드 (dev/prod)
MODE=${1:-dev}

# Docker 이미지 태그
IMAGE_NAME="clover-wallet-api"
IMAGE_TAG="${MODE}-$(date +%Y%m%d-%H%M%S)"

echo "📦 모드: $MODE"
echo "🏷️ 이미지 태그: $IMAGE_TAG"

# 1. Docker 빌드 (BuildKit 사용)
echo ""
echo "🔨 Docker 이미지 빌드 중..."
DOCKER_BUILDKIT=1 docker build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  --cache-from=${IMAGE_NAME}:latest \
  -t ${IMAGE_NAME}:${IMAGE_TAG} \
  -t ${IMAGE_NAME}:latest \
  .

# 2. 이전 컨테이너 중지 및 제거
echo ""
echo "🛑 기존 컨테이너 중지..."
docker stop ${IMAGE_NAME} 2>/dev/null || true
docker rm ${IMAGE_NAME} 2>/dev/null || true

# 3. 새 컨테이너 실행
echo ""
echo "▶️ 새 컨테이너 실행..."
docker run -d \
  --name ${IMAGE_NAME} \
  --restart unless-stopped \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=${MODE} \
  ${IMAGE_NAME}:${IMAGE_TAG}

# 4. 헬스체크
echo ""
echo "🏥 헬스체크 대기 중..."
for i in {1..30}; do
  if curl -f http://localhost:8080/actuator/health 2>/dev/null; then
    echo ""
    echo "✅ 배포 완료!"
    echo "🌐 서버: http://localhost:8080"
    exit 0
  fi
  echo -n "."
  sleep 2
done

echo ""
echo "❌ 헬스체크 실패. 로그를 확인하세요:"
echo "docker logs ${IMAGE_NAME}"
exit 1
