# Clover Wallet API (NestJS)

Clover Wallet의 백엔드 API 서버입니다. NestJS 11 + Prisma 7 기반으로 구현되었습니다.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: NestJS 11
- **ORM**: Prisma 7 (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **Validation**: class-validator + class-transformer
- **Scheduler**: @nestjs/schedule (Cron Job)
- **Testing**: Jest + Supertest

## Architecture

모듈 기반 구조로, 각 도메인이 독립적인 NestJS 모듈로 분리되어 있습니다.

- **Package Structure**: `backend-node/src/{domain}/`
- **Modules**:
  - `auth/`: 인증 (Supabase JWT Guard)
  - `lotto/`: 로또 번호 생성/조회
  - `lotto-spot/`: 명당 판매점 관리
  - `community/`: 커뮤니티 게시판
  - `ticket/`: 티켓 스캔 및 저장
  - `travel/`: 여행 플랜
  - `users/`: 사용자 프로필
  - `admin/`: 데이터 초기화 (크롤링)
  - `notification/`: 알림
  - `prisma/`: Prisma 서비스

## Setup & Run

### Prerequisites
- Node.js 20 이상
- Docker (선택 사항, 로컬 DB 실행 시 필요)

### 1. 환경 변수 설정

`.env` 파일을 `backend-node/` 디렉토리에 생성합니다.

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL Connection URL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT Secret Key | `your-secret` |
| `SUPABASE_JWT_SECRET` | Supabase JWT Secret | `your-supabase-secret` |

### 2. 실행 (Local)
```bash
cd backend-node

# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 개발 서버 실행
npm run start:dev
```

### 3. 테스트
```bash
cd backend-node

# 단위 테스트
npm test

# 커버리지 리포트
npm run test:cov

# E2E 테스트
npm run test:e2e
```

### 4. 실행 (Docker)
```bash
cd backend-node

# Docker 이미지 빌드
docker build -t clover-wallet-api .

# 컨테이너 실행
docker run -p 3000:3000 -e DATABASE_URL=... clover-wallet-api
```

## Deployment (Render)

`render.yaml`에 정의된 설정으로 Render에 자동 배포됩니다.

**배포 시 주의사항:**
1. **Environment Variables**: Render 대시보드에서 `DATABASE_URL`, `JWT_SECRET` 등을 설정해야 합니다.
2. **Health Check**: `/api/v1` 엔드포인트를 사용합니다.
3. **Database**: Prisma 마이그레이션으로 스키마를 관리합니다.

## API Endpoints

- **Auth**: `POST /api/v1/auth/login` (Google SSO)
- **User**: `GET /api/v1/users/{id}`
- **Lotto**:
  - `GET /api/v1/lotto/games` (내 게임 조회)
  - `POST /api/v1/lotto/games` (게임 저장)
  - `GET /api/v1/lotto-spots` (판매점 조회)
- **Ticket**:
  - `POST /api/v1/tickets` (티켓 스캔 및 저장)
  - `GET /api/v1/tickets/{id}`
- **Community**:
  - `GET /api/v1/community/posts`
  - `POST /api/v1/community/posts`

## Data Initialization (Admin)

서버 초기 세팅을 위한 데이터 적재 API입니다.

**1. 당첨 번호 초기화**
```bash
curl -X POST "https://clover-wallet-api.onrender.com/api/v1/admin/init/history"
```

**2. 명당 정보 초기화**
```bash
curl -X POST "https://clover-wallet-api.onrender.com/api/v1/admin/init/spots"
```
