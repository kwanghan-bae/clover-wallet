# 🛠️ Clover Wallet Technical Specification (Unified Monorepo)

## 1. 아키텍처 개요
- **Backend**: Kotlin 1.9.23, Spring Boot 3.2.5 (Location: `/backend`)
- **Frontend**: React Native (Expo SDK 54), TypeScript (Location: `/frontend`)
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Render (Hybrid: Docker + Static Web)

## 2. 모듈 구조
- `/backend`: Multi-module Spring Boot project.
- `/frontend`: Expo-based RN project using NativeWind.

## 3. 주요 API 및 정합성
- JWT 기반 인증 (Supabase Auth 연동)
- REST API 규격 준수