# 🚫 Strict AI Constraints & Anti-Patterns - Clover Wallet

당신은 Clover Wallet의 무결성을 수호해야 합니다.

---

## 1. Coding Taboos
- **Kotlin**: 
    - `!!` (Non-null assertion) 사용 금지. 반드시 안전한 호출이나 엘비스 연산자를 사용하십시오.
    - **No Full Package Annotations**: 어노테이션 사용 시 풀 패키지 경로(e.g., @org.springframework...)를 직접 사용하지 마십시오. 반드시 `import` 문을 추가하고 짧은 이름을 사용하십시오.
- **Flutter**: `setState` 남용 금지. 반드시 `Provider`를 통한 상태 관리를 우선하십시오.

- **Common**: 절대 생략 기호(`// ...`)를 사용하지 마십시오.

## 2. Project Specific Constraints
- 모든 API 응답은 `Result` 래퍼 클래스로 감싸야 합니다.
- 색상 팔레트는 반드시 `CloverTheme` 클래스에 정의된 값을 사용하십시오.