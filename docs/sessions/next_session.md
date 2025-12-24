# Next Session

## Session Goal
- **Phase 2: Critical API Alignment (Frontend Focus)**
- `AUDIT_REPORT.md`에서 식별된 치명적 결함 중 프론트엔드 API 클라이언트를 우선적으로 수정하여 백엔드와의 통신을 정상화한다.

## Context
- Phase 1 감사 결과, Auth 방식 및 응답 래핑 구조에서 중대한 불일치 발견.
- 백엔드 수정 없이 프론트엔드 클라이언트 설정을 고도화하여 해결 가능한 수준임.

## Scope
### Do
- `frontend/api/client.ts`: `CommonResponse` 언래핑 인터셉터 구현.
- `frontend/api/auth.ts`: `supabaseToken`을 전달하는 새로운 로그인 명세 적용.
- `frontend/api/community.ts`: 상위 경로(`community/`) 추가.

## 🏁 Documentation Sync Checklist
- [ ] `TECHNICAL_SPEC.md` (변경된 API 호출 규격 반영)
- [ ] `GLOSSARY.md` (인증 토큰 명칭 동기화)

## Completion Criteria
- 수정된 코드가 `pre_commit.sh`를 통과해야 함.
- 런타임 호출 시 404 또는 파싱 에러가 발생하지 않는 구조 확보.