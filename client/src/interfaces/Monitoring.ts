// 사용자 타입 정의
export interface MonitoringUser {
  id: number;
  name: string;
  isMonitoring: boolean;
}

// 모니터링 업데이트 요청 타입
export interface UpdateMonitoringRequest {
  userIds: number[];
}
