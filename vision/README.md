## Vision API

- Python version : 3.10
- Cuda version : 11.2
- requirements.txt 패키지 설치
  ```
  pip install -r requirements.txt
  ```
- gpu_test.py 실행해서 GPU 사용 가능 여부 체크
- run_server.bat 실행
- 사용자 이미지 등록하면 users 폴더의 pickle 파일에 저장됨
  - 초기에 해당 파일을 지우고 테스트 해보면 됨

### Convention (VS Code)

- 확장 프로그램에 Black Formatter 검색 후 설치
- settings.json 파일에서 가장 바깥 중괄호 안에 아래 코드 추가
  ```json
  "[python]": {
      "editor.defaultFormatter": "ms-python.black-formatter"
    }
  ```
- 설정에서 format on save 검색 후 체크하기
- VS Code 재시작 혹은 시스템 재부팅
