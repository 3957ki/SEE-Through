import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { BsPersonCircle } from "react-icons/bs";

function UserInfoCard() {
  const { currentMember } = useCurrentMember();

  return (
    <div className="bg-white rounded-md shadow-md w-full p-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {currentMember?.avatar ? (
            <img
              src={currentMember.avatar}
              alt={currentMember?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <BsPersonCircle className="w-12 h-12" />
          )}
        </div>
        <div className="ml-4">
          <h3 className="font-bold text-lg">{currentMember?.name}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <span>만 24세, 피관자</span>
          </div>
          <div className="mt-1 flex items-center">
            <span className="text-xs px-2 py-1 bg-orange-100 text-orange-500 rounded-full">
              영양 관리 필요
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfoCard;
