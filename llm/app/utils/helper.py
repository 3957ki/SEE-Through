from datetime import datetime

def parse_datetime(dt_str: str) -> datetime:
    """
    ISO 형식의 문자열을 datetime 객체로 변환하는 유틸리티 함수
    """
    return datetime.fromisoformat(dt_str)
