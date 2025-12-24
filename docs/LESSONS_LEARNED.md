# 🧠 Clover Wallet - Lessons Learned

이 문서는 개발 과정에서 겪은 시행착오와 해결책을 기록하여, AI가 동일한 실수를 반복하지 않도록 합니다.

---

## [L-001] React 19 & Expo 54 의존성 충돌
*   **증상**: `npm install` 시 `react-test-renderer`와 `react` 버전 불일치로 `ERESOLVE` 에러 발생.
*   **해결**: `package.json`에서 `react` 버전을 `19.2.3`으로 고정하고, Render 빌드 시 `--legacy-peer-deps` 옵션을 사용하여 강제 설치함.

## [L-002] Babel 설정 구조 오류 (SyntaxError)
*   **증상**: Expo Web 빌드 시 `plugins` 속성 중복 정의로 `SyntaxError` 발생.
*   **해결**: `babel.config.js`를 표준 구조(`presets: ['babel-preset-expo', 'nativewind/babel']`)로 단순화하여 해결.

## [L-003] MMKV 테스트 환경 타입 에러 (TS2693)
*   **증상**: Jest 환경에서 `MMKV`를 값으로 인지하지 못해 커버리지 수집 실패.
*   **해결**: `require('react-native-mmkv')`를 통한 런타임 로딩으로 TypeScript 컴파일러의 엄격한 타입 체크를 우회함.
