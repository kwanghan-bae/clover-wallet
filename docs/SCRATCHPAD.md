# AI Scratchpad: Deployment Rescue & Phase 6 Initiation

## 1. 현재 상황 분석 (Problem Definition)
- **이슈**: Render 배포 시 `Cannot resolve entry file` 에러 발생.
- **RCA (Root Cause Analysis)**:
    1. `package.json`의 `main` 설정이 실제 파일과 일치하지 않거나 누락됨.
    2. 로컬 빌드 환경(가드)이 실제 배포 환경(Render)의 엄격함을 따라가지 못함 (의존성 누락, 웹 호환성 부족).
    3. `pre-commit.sh` 도입 전의 커밋이 배포를 방해함.

## 2. 해결 설계 (Solution Draft)
- **인지 무결성 확보**: `docs/` 경로 이슈를 바로잡고 프로토콜 이행 완료.
- **배포 복구**: 
    - `index.js` 진입점 명시 및 `package.json` 정규화.
    - 웹 환경 대응 (`CustomMapView.web.tsx`를 통한 `react-native-maps` 격리).
    - 필수 피어 의존성 설치 (`react-native-worklets`, `react-native-svg`).
- **검증 강화**: `pre-commit.sh`에 `expo export`를 포함시켜 배포 성공 가능성을 로컬에서 100% 보장.

## 3. 다음 단계 (Next Steps)
1. 수정된 코드 커밋 (완료).
2. `git push`를 통한 실제 배포 트리거 및 모니터링.
3. `/actuator/health` 및 프론트엔드 접속 확인.
4. `SpotDetail` 기능 개발 착수.