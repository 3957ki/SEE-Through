export interface MemberListItem {
  member_id: string;
  name: string;
  image_path: string;
  is_registered: boolean;
}

export interface MemberListResponse {
  content: MemberListItem[];
  sliceInfo: {
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
  };
}

export interface DetailedMember extends MemberListItem {
  birth: string;
  age: number;
  color: string;
  font_size: string;
  preferred_foods: string[];
  disliked_foods: string[];
  allergies: string[];
  diseases: string[];
  created_at: string;
}

export type Member = MemberListItem | DetailedMember;

export default Member;
