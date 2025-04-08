import { useCurrentMember } from "@/queries/members";
import { BsPersonCircle } from "react-icons/bs";

function UserInfoCard() {
  const { data: currentMember } = useCurrentMember();

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
        <div className="flex-shrink-0">
          {currentMember?.image_path ? (
            <img
              src={currentMember.image_path}
              alt={currentMember.name}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "9999px",
                objectFit: "cover",
              }}
            />
          ) : (
            <BsPersonCircle style={{ width: "48px", height: "48px" }} />
          )}
        </div>
        <div style={{ marginLeft: "16px", flex: 1 }}>
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
            <span>만 {currentMember?.age}세</span>
            {currentMember?.color !== "정상" && (
              <>
                <span style={{ margin: "0 8px" }}>•</span>
                <span>{currentMember?.color}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 구분선 추가 - 프로필 사진 아래까지 확장 */}
      <hr style={{ margin: "12px 0", borderColor: "#E5E7EB", width: "100%" }} />

      {/* 좌우 배치를 위한 컨테이너 */}
      <div style={{ display: "flex", gap: "16px", width: "100%" }}>
        {/* 왼쪽 컬럼 (알러지, 질병) */}
        <div style={{ flex: 1 }}>
          {/* 알레르기 정보 */}
          {currentMember?.allergies && currentMember.allergies.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontSize: "14px",
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
                      fontSize: "12px",
                      padding: "4px 8px",
                      backgroundColor: "#FEE2E2",
                      color: "#EF4444",
                      borderRadius: "9999px",
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
                  fontSize: "14px",
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
                      fontSize: "12px",
                      padding: "4px 8px",
                      backgroundColor: "#DBEAFE",
                      color: "#3B82F6",
                      borderRadius: "9999px",
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
                  fontSize: "14px",
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
                      fontSize: "12px",
                      padding: "4px 8px",
                      backgroundColor: "#D1FAE5",
                      color: "#10B981",
                      borderRadius: "9999px",
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
                  fontSize: "14px",
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
                      fontSize: "12px",
                      padding: "4px 8px",
                      backgroundColor: "#FEF3C7",
                      color: "#F59E0B",
                      borderRadius: "9999px",
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
