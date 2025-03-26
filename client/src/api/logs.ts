import { LogsResponse } from "@/interfaces/Log";
import { APIServerFetcher } from "@/lib/fetchers";

// 로그 데이터를 가져오는 함수
export async function getLogs(page = 1, pageSize = 10, memberId?: string): Promise<LogsResponse> {
  try {
    // URLSearchParams 객체를 사용하여 쿼리 파라미터 구성
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", pageSize.toString());

    // memberId가 있는 경우에만 추가
    if (memberId) {
      params.append("memberId", memberId);
    }

    // 구성된 쿼리 파라미터를 URL에 추가
    const response = await APIServerFetcher.get(`/ingredient-logs?${params.toString()}`);

    if (response.status !== 200) {
      throw new Error("로그 데이터를 가져오는데 실패했습니다");
    }

    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("로그 데이터 가져오기 오류:", error);
    throw error;
  }
}
