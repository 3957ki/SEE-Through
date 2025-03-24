// 로그 인터페이스
export interface Log {
  ingredientLogId: string;
  ingredientName: string;
  ingredientImagePath: string;
  memberId: string;
  memberName: string;
  memberImagePath: string;
  movementName: string;
  createdAt: string;
}

// 그룹화된 로그 인터페이스
export interface GroupedLogs {
  [date: string]: {
    material: string;
    userName: string;
    type: string;
    time: string;
  }[];
}
