import PinModal from "@/components/modal/PinModal";
import { useState } from "react";

const PinModalPage: React.FC = () => {
  const [showPinModal, setShowPinModal] = useState(false);

  const handlePinSuccess = () => {
    alert("PIN 인증 성공! 다음 단계로 진행합니다.");
    setShowPinModal(false);

    // 모니터링 화면으로 이동해야함
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">PIN 모달 예제</h1>
      <button
        onClick={() => setShowPinModal(true)}
        className="px-5 py-2.5 bg-[#FF9933] text-white border-none rounded cursor-pointer hover:bg-[#e88a2a]"
      >
        PIN 모달 열기
      </button>

      {showPinModal && (
        <PinModal
          correctPin="1234"
          onSuccess={handlePinSuccess}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  );
};

export default PinModalPage;
