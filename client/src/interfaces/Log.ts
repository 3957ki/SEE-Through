// 로그 데이터 타입 정의
export interface LogEntry {
  date: string;
  time: string;
  material: string;
  userName: string;
  type: "입고" | "출고";
}

// 날짜별로 그룹화된 로그 타입
export interface GroupedLogs {
  [date: string]: LogEntry[];
}
