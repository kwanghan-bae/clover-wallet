# 📖 Project Glossary (Ubiquitous Language): Clover Wallet

이 문서는 모든 프로젝트 모듈에서 공통으로 사용되는 **핵심 도메인 용어 사전**입니다.

---

## 1. Domain Entities
| 용어 (Korean) | 용어 (English) | 설명 |
| :--- | :--- | :--- |
| 당첨점/명당 | LottoSpot | 1등/2등 당첨자가 배출된 전국의 로또 판매점 정보 |
| 내 번호 | MyNumbers | 사용자가 앱 내에서 생성하거나 수동으로 등록한 관리 번호 세트 |
| 회차 | Round | 매주 추첨되는 로또의 고유 회차 번호 (e.g., 1125회) |
| 낙첨 | Loss | 당첨되지 않은 상태 |
| 당첨금 | Winnings | 해당 회차 및 등수에 따라 지급되는 금액 |

## 2. Technical Terms
- **WinningCheck**: 저장된 `MyNumbers`를 실제 추첨 결과(`Round` 데이터)와 대조하여 등수를 판별하는 프로세스.
- **OCRScan**: ML Kit을 사용하여 실물 로또 용지에서 번호, 회차, 일련번호를 추출하는 행위.
- **LuckyAlgorithm**: 랜덤, 통계, 혹은 가상의 '행운' 규칙에 기반하여 번호를 생성하는 엔진.
- **SpotTour**: 명당 주변의 명소와 연계한 여행 플랜 추천 시스템.
- **TrustBadge**: 게시판 내 사용자 신뢰도를 나타내는 지표 (구매 인증 횟수 기반).