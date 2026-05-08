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

log_info "가비지 정리 완료. (Phase 3 Task 3.2에서 spawn 로직 추가 예정)"
