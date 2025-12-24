# 🚫 Strict AI Constraints & Anti-Patterns

이 문서는 AI가 절대 범해서는 안 되는 **금기 사항(Taboos)**을 정의합니다.

---

## 1. 금지된 코딩 패턴 (Coding Taboos)
- **Unity (C#)**: 
    - `Update()`, `FixedUpdate()` 내에서 `new` 키워드를 통한 객체 생성(Allocation) 금지. (가비지 컬렉션 부하 방지)
    - 매 프레임 실행되는 루프 내에서 `GameObject.Find()`, `GetComponent()` 사용 금지. (Caching 권장)
    - `OnGUI` 메서드 사용 지양.
- **Kotlin**: `!!` (Non-null assertion) 사용 금지.

## 2. 금지된 소통 패턴 (Communication Taboos)
- **추측 금지**: 모르는 내용이 나오면 추측하지 말고 사용자에게 질문하십시오.
- **문서 방치 금지**: 코드를 수정하고 문서를 업데이트하지 않는 행위는 '직무 유기'로 간주합니다.

## 3. 학습된 금기 (User-Specific Learned Taboos)
*(사용자로부터 수정을 받은 사항을 여기에 추가하여 AI가 영구적으로 학습하게 합니다)*
- [ ] 예: "우리 프로젝트에서는 `print()` 대신 반드시 전용 `Logger`를 사용해야 함."
