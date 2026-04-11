# 🍀 Clover Wallet (React Native)

**Clover Wallet**은 로또 번호 생성, 당첨 확인, 명당 찾기, 커뮤니티 기능을 제공하는 통합 로또 플랫폼입니다.
이 프로젝트는 기존 Flutter 앱을 **React Native (Expo)**로 마이그레이션한 결과물입니다.

## ✨ Key Features

- **🎰 Smart Number Generator**: 중복 없는 랜덤 번호 생성 및 애니메이션 효과.
- **📷 OCR Ticket Scan**: 카메라로 로또 용지를 촬영하여 번호와 회차를 자동 인식.
- **🗺️ Lucky Spot Map**: 전국 명당 위치를 지도에서 확인하고 검색.
- **💾 Local History**: 생성/스캔한 번호를 기기에 영구 저장 (mmKV).
- **💬 Community**: 당첨 후기를 공유하고 소통하는 피드 (FlashList).

## 🛠️ Tech Stack

- **Framework**: Expo SDK 50+
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: Expo Router (File-based routing)
- **State/Storage**: React Context, MMKV
- **Network**: Ky (HTTP Client)
- **Maps**: React Native Maps
- **Vision**: React Native ML Kit (OCR)

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- npm or yarn
- Expo Go App (for physical device testing)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/clover-wallet-rn.git
cd clover-wallet-rn

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

### Running on Device/Simulator
- Press `i` for iOS Simulator.
- Press `a` for Android Emulator.
- Scan the QR code with Expo Go app.

## ✅ Testing

We strictly follow **TDD (Test Driven Development)** principles.

```bash
# Run unit tests
npm test
```

## 📂 Project Structure

```
clover-wallet-rn/
├── app/                 # Expo Router Screens
│   ├── (tabs)/          # Bottom Tab Navigation
│   └── ...
├── components/          # Reusable UI Components
│   └── ui/              # Atom-level components (Button, Card...)
├── api/                 # API Clients & Types
├── utils/               # Helper Functions (OCR, Lotto, Storage)
└── __tests__/           # Unit Tests
```

---
Developed with ❤️ by Joel
