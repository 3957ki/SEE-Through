import type { MonitoringUser, UpdateMonitoringRequest } from "@/interfaces/Monitoring";

// 목업 데이터
const mockUsers: MonitoringUser[] = [
  { id: 1, name: "엄마", isMonitoring: false },
  { id: 2, name: "김삼성", isMonitoring: false },
  { id: 3, name: "먼치킨", isMonitoring: true },
  { id: 4, name: "즐라탄", isMonitoring: true },
];

// 모니터링 대상 사용자 목록 가져오기
export const fetchMonitoringUsers = async (): Promise<MonitoringUser[]> => {
  return mockUsers;
};

// 모니터링 설정 업데이트
export const updateMonitoring = async (request: UpdateMonitoringRequest): Promise<boolean> => {
  console.log("모니터링 업데이트 요청:", request);

  // 성공 응답 시뮬레이션
  return true;
};
