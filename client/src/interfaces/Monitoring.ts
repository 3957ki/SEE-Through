// 사용자 타입 정의
export interface MonitoringUser {
  member_id: string;
  name: string;
  image_path: string;
  is_monitored: boolean;
}

// 모니터링 업데이트 요청 타입
export interface UpdateMonitoringRequest {
  userId: string;
}
