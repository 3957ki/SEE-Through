import { useCurrentMember } from "@/queries/members";
import { BsPersonCircle } from "react-icons/bs";

function UserInfoCard() {
  const { data: currentMember } = useCurrentMember();

  return (
    <div className="bg-white rounded-md shadow-md w-full p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {currentMember?.image_path ? (
            <img
              src={currentMember.image_path}
              alt={currentMember.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <BsPersonCircle className="w-12 h-12" />
          )}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-bold text-lg">{currentMember?.name}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <span>만 {currentMember?.age}세</span>
            {currentMember?.color !== "정상" && (
              <>
                <span className="mx-2">•</span>
                <span>{currentMember?.color}</span>
              </>
            )}
          </div>

          {/* 알레르기 정보 */}
          {currentMember?.allergies && currentMember.allergies.length > 0 && (
            <div className="mt-2">
              <div className="text-sm font-bold text-gray-700">알러지</div>
              <div className="flex flex-wrap gap-1 mt-1 pl-4">
                {currentMember.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-red-100 text-red-500 rounded-full"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 질병 정보 */}
          {currentMember?.diseases && currentMember.diseases.length > 0 && (
            <div className="mt-2">
              <div className="text-sm font-bold text-gray-700">질병</div>
              <div className="flex flex-wrap gap-1 mt-1 pl-4">
                {currentMember.diseases.map((disease, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-500 rounded-full"
                  >
                    {disease}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 선호/기피 음식 */}
          <div className="mt-2">
            {currentMember?.preferred_foods && currentMember.preferred_foods.length > 0 && (
              <div className="mb-2">
                <div className="text-sm font-bold text-gray-700">선호 음식</div>
                <div className="flex flex-wrap gap-1 mt-1 pl-4">
                  {currentMember.preferred_foods.map((food, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-green-100 text-green-500 rounded-full"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {currentMember?.disliked_foods && currentMember.disliked_foods.length > 0 && (
              <div>
                <div className="text-sm font-bold text-gray-700">비선호 음식</div>
                <div className="flex flex-wrap gap-1 mt-1 pl-4">
                  {currentMember.disliked_foods.map((food, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 bg-yellow-100 text-yellow-500 rounded-full"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfoCard;
