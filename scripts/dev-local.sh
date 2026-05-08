#!/usr/bin/env bash
# scripts/dev-local.sh
# 로컬 개발 모드: 백엔드 + 프론트엔드 동시 기동, Ctrl-C 일괄 종료, 가비지 정리.

set -euo pipefail

# ─────────────────────────────────────────────────────────
# 색상 / 로깅
# ─────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[dev-local]${NC} $*"; }
log_warn()  { echo -e "${YELLOW}[dev-local]${NC} $*"; }
log_error() { echo -e "${RED}[dev-local]${NC} $*" >&2; }

# ─────────────────────────────────────────────────────────
# 옵션 파싱
# ─────────────────────────────────────────────────────────
SKIP_SEED=false
REMOTE_BACKEND=false
for arg in "$@"; do
  case "$arg" in
    --no-seed)        SKIP_SEED=true ;;
    --remote-backend) REMOTE_BACKEND=true ;;
    -h|--help)
      cat <<EOF
사용법: npm run dev:local [-- --no-seed] [-- --remote-backend]

옵션:
  --no-seed         prisma db seed 건너뛰기 (재시작 빠르게)
  --remote-backend  로컬 백엔드 미기동, 프론트만 띄움 (Render API 사용)
EOF
      exit 0 ;;
    *)
      log_error "알 수 없는 옵션: $arg"
      exit 1 ;;
  esac
done

# ─────────────────────────────────────────────────────────
# 가비지 프로세스 정리
# ─────────────────────────────────────────────────────────
cleanup_port() {
  local port=$1
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    log_warn "포트 $port 잔존 프로세스 종료: $pids"
    kill -TERM $pids 2>/dev/null || true
    sleep 1
    pids=$(lsof -ti:"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      kill -KILL $pids 2>/dev/null || true
    fi
  fi
}

log_info "가비지 프로세스 정리 중..."
if ! $REMOTE_BACKEND; then
  cleanup_port 3000
fi
cleanup_port 8081
cleanup_port 19000
cleanup_port 19001
cleanup_port 19002

log_info "가비지 정리 완료."

# ─────────────────────────────────────────────────────────
# Pre-flight 검사
# ─────────────────────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ ! -f "$ROOT_DIR/apps/frontend/.env" ]; then
  log_error "apps/frontend/.env 누락. .env.example 참고해서 만들어주세요."
  exit 1
fi
if ! $REMOTE_BACKEND && [ ! -f "$ROOT_DIR/apps/backend/.env" ]; then
  log_error "apps/backend/.env 누락. .env.example 참고해서 만들어주세요."
  exit 1
fi
if [ ! -d "$ROOT_DIR/apps/frontend/node_modules" ] || [ ! -d "$ROOT_DIR/apps/backend/node_modules" ]; then
  log_error "node_modules 누락. 루트에서 'npm install' 먼저 실행하세요."
  exit 1
fi

# ─────────────────────────────────────────────────────────
# DB 시드
# ─────────────────────────────────────────────────────────
if ! $SKIP_SEED && ! $REMOTE_BACKEND; then
  log_info "Prisma seed 실행..."
  ( cd "$ROOT_DIR/apps/backend" && DEV_AUTH_ENABLED=true npx prisma db seed )
fi

# ─────────────────────────────────────────────────────────
# spawn helpers
# ─────────────────────────────────────────────────────────
set -m  # job control 활성화 (자식이 새 process group)
CHILD_PIDS=()

prefix_logs() {
  local label=$1
  local color=$2
  sed -u "s/^/$(printf "${color}[${label}]${NC} ")/"
}

# ─────────────────────────────────────────────────────────
# 백엔드 spawn (옵션에 따라)
# ─────────────────────────────────────────────────────────
if ! $REMOTE_BACKEND; then
  log_info "백엔드 기동 (apps/backend)..."
  (
    cd "$ROOT_DIR/apps/backend" && \
    NODE_ENV=development DEV_AUTH_ENABLED=true npm run start:dev 2>&1 \
      | prefix_logs "backend" "$GREEN"
  ) &
  BACKEND_PID=$!
  CHILD_PIDS+=("$BACKEND_PID")
else
  log_warn "--remote-backend: 로컬 백엔드 미기동. EXPO_PUBLIC_API_URL이 Render를 가리키는지 확인."
fi

# ─────────────────────────────────────────────────────────
# 프론트 spawn
# ─────────────────────────────────────────────────────────
log_info "프론트엔드 기동 (apps/frontend)..."
(
  cd "$ROOT_DIR/apps/frontend" && \
  npm start 2>&1 \
    | prefix_logs "frontend" "$BLUE"
) &
FRONTEND_PID=$!
CHILD_PIDS+=("$FRONTEND_PID")

log_info "기동 완료. 종료하려면 Ctrl-C."
log_info "  백엔드 PID: ${BACKEND_PID:-(skipped)}"
log_info "  프론트 PID: $FRONTEND_PID"

# (Task 3.3에서 트랩 + wait 추가)
wait
