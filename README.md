# 귀로 예약 시스템

총동아리연합회 X 사랑방 극 예술연구회가 2026년 9월 29일, 9월 30일 운영하는 축제 스릴러파크 체험 예약 웹사이트입니다. React, TypeScript, Vite, Firebase Authentication, Cloud Firestore, GitHub Pages로 구성되어 별도 Express/PHP/Python 서버 없이 운영합니다.

## 주요 기능

- 2026-09-29, 2026-09-30 각 15개 예약 슬롯 실시간 표시 (14:45 브레이크타임 제외)
- Firestore transaction 기반 예약 생성, 시간 변경, 취소
- `representativeLocks/{phoneHash}` 기반 동일 전화번호 중복 예약 방지
- 예약번호와 강력한 예약 관리 코드 기반 조회, 변경, 취소
- 개인정보를 포함하지 않는 `slots` 공개 조회 구조
- 관리자 Email/Password 로그인, UID 기반 `admins/{uid}` 권한 확인
- 관리자 대시보드, 예약 검색/필터/정렬, 입금 확인, 예약 수정/취소, 슬롯 차단, CSV 다운로드
- GitHub Pages 자동 배포 workflow

## 1. 프로젝트 설치

```bash
npm install
```

## 2. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속합니다.
2. `프로젝트 추가`를 누르고 프로젝트를 생성합니다.
3. 왼쪽 메뉴 `프로젝트 개요`에서 웹 앱을 추가합니다.
4. 표시되는 Firebase Web App config 값을 `.env`에 입력합니다.

```bash
cp .env.example .env
```

`.env`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Firebase Web API Key는 비밀 서버키가 아닙니다. 실제 데이터 보호는 Authentication과 Firestore Security Rules가 담당합니다.

## 3. Firestore 생성

1. Firebase Console 왼쪽 메뉴 `빌드 > Firestore Database`로 이동합니다.
2. `데이터베이스 만들기`를 선택합니다.
3. 위치를 선택하고 프로덕션 모드로 시작합니다.

## 4. Authentication 활성화

1. Firebase Console 왼쪽 메뉴 `빌드 > Authentication`으로 이동합니다.
2. `시작하기`를 누릅니다.
3. `Sign-in method` 탭에서 `익명`을 활성화합니다.
4. 같은 화면에서 `이메일/비밀번호`를 활성화합니다.

익명 인증은 비로그인 예약자도 Firestore Rules 안에서 인증된 요청으로 처리하기 위해 사용합니다.

## 5. 관리자 계정 생성

1. `Authentication > Users`에서 `사용자 추가`를 누릅니다.
2. 관리자 이메일과 비밀번호를 입력합니다.
3. 생성된 사용자의 UID를 복사합니다.
4. `Firestore Database > 데이터`에서 `admins` collection을 만들고, 문서 ID를 관리자 UID로 생성합니다.
5. 문서 내용은 예를 들어 `{ "role": "admin" }` 정도만 넣어도 됩니다.

관리자 비밀번호나 UID는 코드에 하드코딩하지 않습니다.

## 6. Firestore Rules 배포

Firebase CLI에 로그인한 뒤 프로젝트를 지정합니다.

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
firebase deploy --only firestore:rules,firestore:indexes
```

`.firebaserc`의 `YOUR_FIREBASE_PROJECT_ID`도 실제 프로젝트 ID로 바꿀 수 있습니다.

## 7. 예약 슬롯 초기화

개발자 PC에서 Google Application Default Credentials 또는 서비스 계정으로 Admin SDK 권한을 준비합니다.

```bash
set FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json
npm run init:slots
```

예약 가능 슬롯은 2026-09-29와 2026-09-30 각각 15개이며, 양일 14:45는 브레이크타임으로 차단합니다.

## 8. 로컬 실행

```bash
npm run dev
```

브라우저에서 표시되는 로컬 주소를 열고 예약, 조회, 관리자 로그인을 확인합니다.

## 9. 테스트

자동 단위 테스트:

```bash
npm test
```

운영 전에는 [tests/manual-scenarios.md](tests/manual-scenarios.md)의 시나리오를 Firebase 실제 프로젝트 또는 Emulator 환경에서 확인하세요.

## 10. Production build

```bash
npm run build
```

GitHub Pages project page에서도 asset 경로가 깨지지 않도록 `vite.config.ts`는 `VITE_BASE_PATH`를 지원합니다.

## 11. GitHub repository 생성

1. GitHub에서 새 repository를 생성합니다.
2. 이 프로젝트를 push합니다.
3. repository `Settings > Secrets and variables > Actions`로 이동합니다.
4. 아래 Secrets를 추가합니다.

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_APP_CHECK_RECAPTCHA_V3_SITE_KEY`는 App Check를 쓸 때만 입력합니다.

## 12. GitHub Pages 설정

1. GitHub repository `Settings > Pages`로 이동합니다.
2. `Build and deployment`의 Source를 `GitHub Actions`로 선택합니다.
3. `main` 브랜치에 push하면 `.github/workflows/pages.yml`이 빌드 후 Pages에 배포합니다.

## 13. App Check 선택 설정

1. Firebase Console `빌드 > App Check`로 이동합니다.
2. 웹 앱에 reCAPTCHA v3를 등록합니다.
3. 발급된 site key를 `.env`와 GitHub Actions secret `VITE_FIREBASE_APP_CHECK_RECAPTCHA_V3_SITE_KEY`에 입력합니다.

App Check는 남용 완화 장치이며 Security Rules를 대체하지 않습니다.

## 14. 데이터 구조

- `slots/{date_time}`: 공개 예약 현황. 개인정보 없음.
- `bookings/{accessKey}`: 예약 상세. 예약번호와 관리 코드에서 계산되는 강한 접근 키를 문서 ID로 사용합니다.
- `representativeLocks/{phoneHash}`: 동일 전화번호 중복 예약 방지.
- `admins/{uid}`: 관리자 권한 문서.
- `settings/reservation`: 예약 접수 `OPEN` 또는 `CLOSED`.
- `auditLogs/{logId}`: 관리자 중요 작업 기록.

## 15. 현장 운영 체크

- 예약 화면이 `bookings` collection을 list/query하지 않는지 DevTools에서 확인합니다.
- 두 기기에서 같은 시간을 동시에 예약해 한 명만 성공하는지 확인합니다.
- 같은 전화번호로 다른 시간 예약이 막히는지 확인합니다.
- 관리자가 입금 확인 후 사용자가 예약을 변경하면 입금 상태가 `변경사항 확인 필요`로 바뀌는지 확인합니다.
- CSV 다운로드 파일이 Excel에서 한글 깨짐 없이 열리는지 확인합니다.
