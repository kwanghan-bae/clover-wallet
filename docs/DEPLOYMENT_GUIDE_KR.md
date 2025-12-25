# 배포 가이드

이 가이드는 무료 서비스인 **Supabase** (데이터베이스)와 **Render** (서버)를 사용하여 Clover Wallet 백엔드를 배포하는 방법을 설명합니다.

## 사전 준비
- GitHub 계정
- [Supabase 계정](https://supabase.com)
- [Render 계정](https://render.com)

## 1. 데이터베이스 설정 (Supabase)
1.  [Supabase](https://supabase.com)에 로그인합니다.
2.  "New Project"를 클릭합니다.
3.  이름(예: `backend-db`), 비밀번호(**꼭 기억해두세요!**), 지역(예: Seoul 또는 Tokyo)을 입력합니다.
4.  데이터베이스가 생성될 때까지 기다립니다.
5.  **Project Settings** -> **Database**로 이동합니다.
6.  **Connection parameters**에서 다음 정보를 확인합니다:
    -   **Host** (예: `db.xyz.supabase.co`)
    -   **User** (보통 `postgres`)
    -   **Port** (5432)
    -   **Database** (보통 `postgres`)
7.  `DB_URL`을 다음과 같이 조합합니다:
    `jdbc:postgresql://<Host>:5432/<Database>`
    (예시: `jdbc:postgresql://db.xyz.supabase.co:5432/postgres`)

## 2. 백엔드 배포 (Render)
1.  코드를 GitHub에 푸시합니다.
2.  [Render](https://render.com)에 로그인합니다.
3.  "New +" -> "Web Service"를 클릭합니다.
4.  GitHub 저장소(`backend`)를 연결합니다.
5.  **서비스 설정:**
    -   **Name:** `backend-api`
    -   **Runtime:** `Docker`
    -   **Region:** Singapore 또는 Oregon (무료 티어 사용 가능 지역)
    -   **Instance Type:** Free
6.  **환경 변수 (Environment Variables):**
    다음 변수들을 추가합니다:
    -   `SPRING_PROFILES_ACTIVE`: `prod`
    -   `DB_URL`: (1단계에서 만든 Supabase JDBC URL)
    -   `DB_USERNAME`: `postgres`
    -   `DB_PASSWORD`: (1단계에서 설정한 비밀번호)
7.  "Create Web Service"를 클릭합니다.

## 3. 검증
1.  빌드가 완료될 때까지 기다립니다.
2.  Render가 제공하는 URL을 확인합니다 (예: `https://backend-api.onrender.com`).
3.  Health check 또는 API 엔드포인트를 테스트합니다:
    `https://backend-api.onrender.com/actuator/health` (활성화된 경우) 또는 알려진 API 엔드포인트.

## 4. 프론트엔드 연결
1.  React Native 앱의 `frontend/api/client.ts` 파일을 열어 Render URL을 프로덕션용으로 업데이트합니다.

---

## 5. 실 배포 현황 (Live Deployment Status)
*   **Backend API**: [https://clover-wallet-api.onrender.com](https://clover-wallet-api.onrender.com)
*   **Frontend Web**: [https://clover-wallet-app-web.onrender.com/](https://clover-wallet-app-web.onrender.com/)
*   **Database**: Supabase (Connection via JDBC/R2DBC)

