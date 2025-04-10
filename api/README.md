# 1. Java Version

- Eclipse Temurin 17.0.13

# 2. IDE Setting

## 2-1. 네이버 코딩 컨벤션 적용

1. [Naver Formatter 다운로드](https://github.com/naver/hackday-conventions-java/blob/master/rule-config/naver-intellij-formatter.xml)
2. File → Settings (Alt + Ctrl + S)

### Editor → Code Style

1. Scheme 항목의 오른쪽 톱니바퀴 아이콘 선택
2. Import Scheme → Intellij IDEA Code Style XML
3. 다운받은 Formatter xml 선택
4. (선택) `To`에 저장할 이름 설정
5. 아래 설정 체크
    - General 탭 → Hard wrap at → `150` 작성

### Editor → Code Style → Java

1. 아래 설정 체크
    - Wrapping and Braces 탭 → 'if()' statement → `'else' on new line`

### Editor → Code Style → Properties

1. 아래 설정 체크
    - `Keep blank lines`

## 2-2. 자동 임포트 설정

1. File → Settings (Alt + Ctrl + S)
2. Editor → General → Auto Import
3. 아래 설정 체크
    - `Add unambiguous imports on the fly`
    - `Optimize imports on the fly`

## 2-3. 코딩 컨벤션 자동 적용 설정

1. File → Settings (Alt + Ctrl + S)
2. Tools → Actions on Save
3. 아래 설정 체크
    - `Reformat code`
    - `Optimize imports`