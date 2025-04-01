import { useCurrentMemberId } from "@/contexts/CurrentMemberIdContext";
import { useDialog } from "@/contexts/DialogContext";
import Member from "@/interfaces/Member";
import { useMembers } from "@/queries/members";
import { BsPersonCircle } from "react-icons/bs";

interface MemberItemProps {
  member: Member;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function MemberItem({ member, isSelected, onSelect }: MemberItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected ? "bg-orange-100" : "hover:bg-gray-100"
      }`}
      onClick={() => onSelect(member.member_id)}
    >
      {member.image_path ? (
        <img
          src={member.image_path}
          alt={member.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <BsPersonCircle className="w-10 h-10 text-gray-400" />
      )}
      <div>
        <h3 className="font-medium">{member.name}</h3>
        <p className="text-sm text-gray-500">만 24세, 피관자</p>
      </div>
    </div>
  );
}

export function MemberSwitcherDialog() {
  const { data: members = [] } = useMembers();
  const { currentMemberId, setCurrentMemberId } = useCurrentMemberId();
  const { hideDialog } = useDialog();

  const handleSelectMember = async (id: string) => {
    try {
      // Get member details directly
      // const member = await getMember(id);

      setCurrentMemberId(id);
      hideDialog();
    } catch (error) {
      console.error("Failed to fetch member:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-1">멤버 선택</h2>
        <p className="text-sm text-gray-500">얼굴 인식이 잘못된 경우 멤버를 선택하세요</p>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {members.length > 0 ? (
          members.map((member) => (
            <MemberItem
              key={member.member_id}
              member={member}
              isSelected={member.member_id === currentMemberId}
              onSelect={handleSelectMember}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>등록된 멤버가 없습니다</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3 mt-2">
        <button
          className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium"
          onClick={hideDialog}
        >
          취소
        </button>
        <button
          className="bg-orange-400 text-white px-5 py-2 rounded-lg font-medium"
          onClick={hideDialog}
        >
          확인
        </button>
      </div>
    </div>
  );
}
