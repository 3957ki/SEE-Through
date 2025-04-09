import { useCurrentMember } from "@/queries/members";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { BsPersonCircle } from "react-icons/bs";

function UserInfoCard() {
  const { data: currentMember } = useCurrentMember();

  // age가 undefined일 경우 0으로 처리
  const age = currentMember?.age ?? 0;
  const showAge = age > 0;
  const color = currentMember?.color;
  const isNormalColor = color === "정상";

  return (
    <div
      className="bg-white rounded-md shadow-md w-full"
      style={{
        padding: "16px",
        fontSize: "16px",
      }}
    >
      {/* 프로필 정보 */}
      <div className="flex items-start">
        <Avatar className="h-[64px] w-[64px] cursor-pointer bg-muted rounded-full overflow-hidden">
          <AvatarImage
            src={currentMember?.image_path}
            alt="User avatar"
            className="rounded-full object-cover w-full h-full"
          />
          <AvatarFallback>
            <BsPersonCircle className="w-full h-full" />
          </AvatarFallback>
        </Avatar>
        <div
          style={{
            marginLeft: "16px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: showAge || (!isNormalColor && color) ? "flex-start" : "center",
          }}
        >
          <h3
            style={{
              fontWeight: "bold",
              fontSize: "18px",
              lineHeight: "1.5",
            }}
          >
            {currentMember?.name}
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              color: "#4B5563",
              marginTop: "4px",
            }}
          >
            {showAge && <span>만 {age}세</span>}
            {!isNormalColor && color && (
              <>
                {showAge && <span style={{ margin: "0 8px" }}>•</span>}
                <span>{color}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 구분선 추가 - 프로필 사진 아래까지 확장 */}
      {((currentMember?.allergies?.length ?? 0) > 0 ||
        (currentMember?.diseases?.length ?? 0) > 0 ||
        (currentMember?.preferred_foods?.length ?? 0) > 0 ||
        (currentMember?.disliked_foods?.length ?? 0) > 0) && (
        <hr style={{ margin: "12px 0", borderColor: "#E5E7EB", width: "100%" }} />
      )}

      {/* 좌우 배치를 위한 컨테이너 */}
      <div style={{ display: "flex", gap: "16px", width: "100%" }}>
        {/* 왼쪽 컬럼 (알러지, 질병) */}
        <div style={{ flex: 1 }}>
          {/* 알레르기 정보 */}
          {currentMember?.allergies && currentMember.allergies.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                알러지
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                {currentMember.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: "14px",
                      padding: "6px 10px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      color: "#EF4444",
                      borderRadius: "8px",
                      fontWeight: "700",
                    }}
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 질병 정보 */}
          {currentMember?.diseases && currentMember.diseases.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                질병
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                {currentMember.diseases.map((disease, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: "14px",
                      padding: "6px 10px",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      color: "#3B82F6",
                      borderRadius: "8px",
                      fontWeight: "700",
                    }}
                  >
                    {disease}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽 컬럼 (선호/비선호 음식) */}
        <div style={{ flex: 1 }}>
          {/* 선호 음식 */}
          {currentMember?.preferred_foods && currentMember.preferred_foods.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                선호 음식
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                {currentMember.preferred_foods.map((food, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: "14px",
                      padding: "6px 10px",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      color: "#10B981",
                      borderRadius: "8px",
                      fontWeight: "700",
                    }}
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 비선호 음식 */}
          {currentMember?.disliked_foods && currentMember.disliked_foods.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#374151",
                }}
              >
                비선호 음식
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                {currentMember.disliked_foods.map((food, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: "14px",
                      padding: "6px 10px",
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                      color: "#F59E0B",
                      borderRadius: "8px",
                      fontWeight: "700",
                    }}
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
  );
}

export default UserInfoCard;
