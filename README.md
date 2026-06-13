# FamilyLink - Frontend

React + Vite 기반 프론트엔드 서비스
FamilyLink는 멀티플랫폼(Web, App, VR) 사용자가 함께 모여 실시간으로 노래하고 소통할 수 있는 실시간 온라인 노래방 서비스의 프론트엔드다. 

단순한 음성 채팅을 넘어, YouTube MR 영상과 WebRTC 오디오 간의 밀리초(ms) 단위 동기화를 구현하여 끊김 없이 노래방 경험을 제공에 중점으로 개발하였다.

## 기술 스택

| 분류 | 기술 및 라이브러리 |
|------|------|
| **Core** | React 19, Vite, React Router 7 |
| **State Management** | Zustand 5 (전역 상태 관리) |
| **Real-time Comms** | Socket.IO Client 4 (상태 동기화), Agora RTC (음성) |
| **Media** | react-youtube (IFrame API 제어) |
| **Network** | Axios (API 호출) |

## 프로젝트 구조

```
Front/
├── src/
│   ├── api/            # API 호출 (client.js)
│   ├── hooks/          # 커스텀 훅
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── AuthPage.jsx
│   │   ├── HomePage.jsx
│   │   └── RoomPage.jsx
│   ├── store/          # Zustand 전역 상태
│   │   ├── authStore.js
│   │   └── roomStore.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── .env                # 환경변수 (직접 생성)
└── vite.config.js
```

## 설치 및 실행

> BackServer를 먼저 설치하고 실행한 뒤 진행하세요.

**Windows**
```bat
setup.bat   # 최초 1회
start.bat   # 매번 실행
```

**Mac / Linux**
```bash
chmod +x setup.sh start.sh
./setup.sh  # 최초 1회
./start.sh  # 매번 실행
```

개발 서버: http://localhost:5173

## 환경변수

`.env` 파일을 생성하고 아래 내용을 설정하세요:

```env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

> 배포 환경에서는 실제 서버 주소로 변경해야 합니다.

## 사용 가능한 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
```

## 배포 (Vercel)

1. [Vercel](https://vercel.com)에 로그인
2. `Front` 폴더를 루트로 하는 프로젝트 생성
3. 환경변수 설정 (`VITE_API_URL`, `VITE_SOCKET_URL`)
4. 자동 배포 완료
