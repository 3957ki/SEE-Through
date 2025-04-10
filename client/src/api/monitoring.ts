import type { MonitoringUser, UpdateMonitoringRequest } from "@/interfaces/Monitoring";
import { APIServerFetcher } from "@/lib/fetchers";

// 모니터링 대상 사용자 목록 가져오기
export const fetchMonitoringUsers = async (): Promise<MonitoringUser[]> => {
  try {
    const response = await APIServerFetcher.get("/members/monitoring");

    if (response.status !== 200) {
      throw new Error("모니터링 대상자 가져오기 실패");
    }

    return response.data.content;
  } catch (error) {
    console.error("모니터링 대상자 가져오기 요청 오류: ", error);
    throw error;
  }
};

// 모니터링 설정 업데이트
export const updateMonitoring = async (request: UpdateMonitoringRequest): Promise<boolean> => {
  try {
    const response = await APIServerFetcher.patch(`/members/${request.userId}/monitoring`);

    if (response.status !== 200) {
      throw new Error("모니터링 설정 업데이트 실패");
    }

    return true;
  } catch (error) {
    console.error("모니터링 상태 저장 요청 오류: ", error);
    throw error;
  }
};
