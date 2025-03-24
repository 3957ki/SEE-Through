import { Log } from "@/interfaces/Log";
import { APIServerFetcher } from "@/lib/fetchers";

interface LogsResponse {
  content: Log[];
  sliceInfo: {
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
  };
}

// 로그 데이터를 가져오는 함수
export async function getLogs(page = 1, pageSize = 10): Promise<LogsResponse> {
  try {
    // API 엔드포인트에 페이지네이션 파라미터 추가
    const response = await APIServerFetcher.get(
      `/ingredient-logs?page=${page}&pageSize=${pageSize}`
    );

    if (response.status !== 200) {
      throw new Error("로그 데이터를 가져오는데 실패했습니다");
    }

    return response.data;
  } catch (error) {
    console.error("로그 데이터 가져오기 오류:", error);
    throw error;
  }
}
