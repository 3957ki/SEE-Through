# 프로젝트 설명

- React + TypeScript + Vite: This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
- 본 프로젝트는 SWC를 사용합니다.
  - [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## 작업 시 권장 사항

1. VSCode 사용을 권장합니다.
2. `client` 폴더를 root 폴더로 하여 (`client` 폴더를 열어서) 작업하는 것을 권장합니다.

## ESLint

### 규칙 요약

TypeScript와 React를 위한 규칙들을 적용했습니다:

- 주요 플러그인:
  - typescript-eslint: TypeScript 코드 검사
  - react-hooks: React Hooks 규칙 검사
  - react-refresh: Fast Refresh 관련 규칙
  - react-x: React 관련 추가 규칙
  - react-dom: React DOM 관련 규칙
  - react-naming-convention: 파일 및 컴포넌트 명명 규칙
- 파일 명명 규칙:
  - 컴포넌트 파일: PascalCase (src/components/, src/pages/)
    - 단 특정 파일(main.tsx, vite-env.d.ts, vite.config.ts)은 명명 규칙 예외 처리

### ESLint 검사 방법

ESLint 검사는 다음과 같은 방법으로 수행할 수 있습니다:

1. CLI 명령어를 통한 검사:
   ```bash
   npx eslint .           # 전체 프로젝트 검사
   npx eslint src/        # src 디렉토리만 검사
   ```

2. VS Code를 사용하는 경우:
   - ESLint 확장 프로그램을 설치하면 코드 작성 시 실시간으로 문제를 확인할 수 있습니다.
   - 파일 저장 시 자동으로 검사가 실행됩니다.

## Prettier 설정

### 규칙 요약

코드 스타일의 일관성을 위해 다음과 같은 Prettier 규칙을 적용했습니다:

- 들여쓰기: 2칸 공백
- 문자열: 작은따옴표 사용
- 세미콜론: 항상 사용
- 한 줄 최대 길이: 80자
- trailing comma: 항상 사용
- 화살표 함수 괄호: 인자가 하나일 때 생략

### Prettier 포맷팅 방법

1. CLI 명령어:
   ```bash
   npm run format        # 전체 파일 포맷팅
   npm run format:check # 포맷팅 필요 여부 확인
   ```

2. VS Code:
   - Prettier 확장 프로그램이 설치되어 있으면 파일 저장 시 자동 포맷팅됩니다.
