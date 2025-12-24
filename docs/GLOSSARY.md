# 📖 Project Glossary (Ubiquitous Language)

이 문서는 백엔드와 프론트엔드 간의 소통 혼선을 방지하기 위한 핵심 용어 사전입니다.

---

## 1. Domain Entities
| 용어 (Korean) | 용어 (English) | 설명 |
| :--- | :--- | :--- |
| 로또 명당 | LottoSpot | 1등 당첨자가 배출된 판매점 |
| 생성 번호 | LottoGame | 앱 내 알고리즘을 통해 생성된 번호 조합 |
| 구매 내역 | LottoTicket | 사용자가 실제 구매하여 OCR 등으로 등록한 티켓 |
| 뱃지 | Badge | 활동성 및 당첨 내역에 따라 부여되는 업적 |

## 2. Technical Terms
- **WinningCheck**: 백엔드 크롤러가 수집한 번호와 사용자 번호를 대조하는 프로세스.
- **ScanSync**: 프론트엔드에서 OCR로 읽은 데이터를 백엔드 API로 전송하여 영속화하는 행위.