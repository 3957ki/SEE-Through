import { LogEntry } from "@/interfaces/Log";

// 목업 데이터
const mockLogs: LogEntry[] = [
  {
    date: "2025-03-21",
    time: "17:35",
    material: "사과",
    userName: "김다정",
    type: "입고",
  },
  {
    date: "2025-03-21",
    time: "19:00",
    material: "사과",
    userName: "김종현",
    type: "출고",
  },
  {
    date: "2025-03-21",
    time: "14:20",
    material: "당근",
    userName: "이민지",
    type: "입고",
  },
  {
    date: "2025-03-21",
    time: "20:15",
    material: "양파",
    userName: "박지훈",
    type: "입고",
  },
  {
    date: "2025-03-20",
    time: "09:15",
    material: "바나나",
    userName: "이지민",
    type: "입고",
  },
  {
    date: "2025-03-20",
    time: "14:30",
    material: "바나나",
    userName: "박서준",
    type: "출고",
  },
  {
    date: "2025-03-20",
    time: "11:45",
    material: "토마토",
    userName: "최유진",
    type: "입고",
  },
  {
    date: "2025-03-20",
    time: "16:20",
    material: "우유",
    userName: "정현우",
    type: "입고",
  },
  {
    date: "2025-03-20",
    time: "18:05",
    material: "토마토",
    userName: "김민수",
    type: "출고",
  },
  {
    date: "2025-03-19",
    time: "10:30",
    material: "계란",
    userName: "이수진",
    type: "입고",
  },
  {
    date: "2025-03-19",
    time: "13:15",
    material: "치즈",
    userName: "강동원",
    type: "입고",
  },
  {
    date: "2025-03-19",
    time: "17:40",
    material: "계란",
    userName: "황지영",
    type: "출고",
  },
];

// 로그 데이터를 가져오는 함수
export async function getLogs(): Promise<LogEntry[]> {
  // 목업 데이터 반환
  return mockLogs;
}
