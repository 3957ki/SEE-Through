// 로그 인터페이스
export interface Log {
  ingredient_log_id: string;
  ingredient_name: string;
  ingredient_image_path: string;
  member_id: string;
  member_name: string;
  member_image_path: string;
  movement_name: string;
  created_at: string;
}

// 그룹화된 로그 인터페이스
export interface GroupedLogs {
  [date: string]: {
    ingredient: string;
    ingredient_image: string;
    user_name: string;
    user_image: string;
    type: string;
    time: string;
  }[];
}

// 로그 응답 인터페이스
export interface LogsResponse {
  content: Log[];
  slice_info: {
    current_page: number;
    page_size: number;
    has_next: boolean;
  };
}
