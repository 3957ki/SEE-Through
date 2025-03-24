import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useDialog } from "@/contexts/DialogContext";
import { useMembers } from "@/contexts/MembersContext";
import Member from "@/interfaces/Member";
import { BsPersonCircle } from "react-icons/bs";

interface MemberItemProps {
  member: Member;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const MemberItem = ({ member, isSelected, onSelect }: MemberItemProps) => {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${isSelected ? "bg-orange-100" : "hover:bg-gray-100"}`}
      onClick={() => onSelect(member.member_id)}
    >
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
        {member.image_path ? (
          <img src={member.image_path} alt={member.name} className="w-full h-full object-cover" />
        ) : (
          <BsPersonCircle className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{member.name}</h3>
      </div>
      {isSelected && <div className="w-3 h-3 bg-orange-400 rounded-full"></div>}
    </div>
  );
};

export function MemberSwitcherDialog() {
  const { members } = useMembers();
  const { currentMember, setCurrentMember } = useCurrentMember();
  const { hideDialog } = useDialog();

  const handleSelectMember = (id: string) => {
    setCurrentMember(id);
    hideDialog();
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
              isSelected={member.member_id === currentMember?.member_id}
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
