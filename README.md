# Commit Message Convention

## 형식

```
<커밋 타입>: <제목>

<본문> (선택 사항)

<이슈 번호> (선택 사항)
```

- 제목과 본문, 본문과 이슈 번호 사이를 빈행으로 분리
  - 커밋 유형 이후 제목과 본문은 한글로 작성하여 내용이 잘 전달될 수 있도록 할 것

### 커밋 타입
| 이모지 | 타입 | 설명 |
|-------|-----|-------------|
| ✨ | `:sparkles: Feat` | 새로운 기능 추가 |
| 🐛 | `:bug: Fix` | 버그 수정 |
| ♻️ | `:recycle: Refactor` | 코드 리팩토링 (기능 변경 없음) |
| 🎨 | `:art: Style` | 코드 스타일 변경 (포매팅, 세미콜론 추가 등) |
| 📝 | `:memo: Docs` | 문서 수정 |
| ✅ | `:white_check_mark: Test` | 테스트 코드 추가/수정 |
| 🔧 | `:wrench: Chore` | 빌드, 패키지 매니저 설정 등 기타 변경사항 |
| ⚡ | `:zap: Perf` | 성능 개선 |

### 제목

- 제목 첫 글자는 대문자로, 끝에는 `.` 금지
- 제목은 영문 기준 50자 이내로 할 것

### 본문

- 여러가지 항목이 있다면 글머리 기호를 통해 가독성 높이기

```
- 변경 내용 1
- 변경 내용 2
- 변경 내용 3
```

## 예시
```bash
:sparkles: Feat: 사용자 로그인 기능 추가

- JWT 토큰을 이용한 인증 방식 적용
- 로그인 API 구현

Resolves: #S002 (Jira 이슈 번호)
```

## `.gitmessage.txt` 사용법 (git commit template 설정)

1. 로컬 레포지터리 루트 폴더에서 `git config --local commit.template .gitmessage.txt` 실행
2. 이후 cli 상으로 `git commit` 혹은 VSCode의 GUI 상으로 (commit message 입력란을 비운 채로) `commit`을 누르면 `COMMIT_EDITMSG` 파일 편집창이 열림. 템플릿을 읽고 적절하게 comment out 및 수정 후 편집 창 닫기

---

# Branch Naming Convention

브랜치는 기능 단위로 생성하며, 다음 규칙을 따릅니다.

```
<타입>/<헤더>/<작업 내용>
```

### 브랜치 타입
| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 개발 |
| `fix` | 버그 수정 |
| `chore` | 기타 작업 |

### 브랜치 헤더
Jira에 작성한 `[]` 헤더와 통일합니다.

### 브랜치 예시
```
feat/spring/login-api
feat/vision/face-detection
fix/fe/user-profile-bug
```
