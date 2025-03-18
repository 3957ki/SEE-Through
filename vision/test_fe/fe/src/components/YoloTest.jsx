import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

export default function FaceRecognition() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [registerResponse, setRegisterResponse] = useState(null);
  const [metadataResponse, setMetadataResponse] = useState(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [recognizedUser, setRecognizedUser] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();

    // 캡처된 이미지를 원래 방향으로 보이도록 좌우 반전
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      // 좌우 반전 적용
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // 반전된 이미지를 상태값으로 저장
      setImage(canvas.toDataURL("image/jpeg"));
    };
  };

  const handleUpload = async () => {
    if (!image) {
      alert("사진을 먼저 촬영하세요.");
      return;
    }

    const blob = await fetch(image).then((res) => res.blob());
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:9000/find_faces", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResponse(res.data);

      // 결과 확인 및 처리
      if (res.data.result && res.data.result.length === 0) {
        // 신규 사용자인 경우
        setShowRegisterDialog(true);
        setRecognizedUser(null);
      } else if (res.data.result && res.data.result.length > 0) {
        // 기존 사용자인 경우
        setRecognizedUser(res.data.result[0].identity);
        setShowRegisterDialog(false);
      }
    } catch (error) {
      console.error("업로드 실패:", error);
      setResponse("업로드 실패");
    }
  };

  const handleRegister = async () => {
    if (!image) {
      alert("사진을 먼저 촬영하세요.");
      return;
    }

    const blob = await fetch(image).then((res) => res.blob());
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:9000/register_user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setRegisterResponse(res.data);
      setShowRegisterDialog(false);
    } catch (error) {
      console.error("등록 실패:", error);
      setRegisterResponse("등록 실패");
    }
  };

  const handleMetadataRequest = async () => {
    if (!image) {
      alert("사진을 먼저 촬영하세요.");
      return;
    }

    const blob = await fetch(image).then((res) => res.blob());
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:9000/info_user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMetadataResponse(res.data);
    } catch (error) {
      console.error("메타데이터 요청 실패:", error);
      setMetadataResponse("메타데이터 요청 실패");
    }
  };

  useEffect(() => {
    if (image && response?.result?.length) {
      const faceData = response.result[0]; // 첫 번째 얼굴 정보 사용
      const img = new Image();
      img.src = image;

      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // 캔버스 크기 설정
        canvas.width = img.width;
        canvas.height = img.height;

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, img.width, img.height);

        // 얼굴 박스 그리기
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(faceData.source_x, faceData.source_y, faceData.source_w, faceData.source_h);
      };
    }
  }, [response, image]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">얼굴 인식 시스템</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 왼쪽 열: 웹캠 및 버튼 */}
        <div className="w-full md:w-1/2">
          <div className="mb-6 border rounded-lg overflow-hidden">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" mirrored={true} className="w-full" />
          </div>

          <div className="flex gap-4 mb-6">
            <button onClick={capture} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              사진 촬영
            </button>
            <button onClick={handleUpload} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
              얼굴 인식
            </button>
            <button
              onClick={handleRegister}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              사용자 등록하기
            </button>
            <button
              onClick={handleMetadataRequest}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              메타데이터 요청
            </button>
          </div>

          {recognizedUser && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-green-600 mr-2 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <div>
                <h4 className="font-medium text-green-800">사용자 인식 완료</h4>
                <p className="text-green-700">환영합니다, {recognizedUser} 님!</p>
              </div>
            </div>
          )}

          {response && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg overflow-auto">
              <h3 className="text-lg font-semibold mb-2">📌 얼굴 인식 응답:</h3>
              <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
            </div>
          )}

          {registerResponse && (
            <div className="p-4 bg-gray-50 rounded-lg overflow-auto">
              <h3 className="text-lg font-semibold mb-2">📌 사용자 등록 응답:</h3>
              <pre className="text-sm">{JSON.stringify(registerResponse, null, 2)}</pre>
            </div>
          )}

          {metadataResponse && (
            <div className="p-4 bg-gray-50 rounded-lg overflow-auto">
              <h3 className="text-lg font-semibold mb-2">📌 메타데이터 응답:</h3>
              <pre className="text-sm">{JSON.stringify(metadataResponse, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* 오른쪽 열: 촬영된 사진 및 얼굴 인식 결과 */}
        <div className="w-full md:w-1/2">
          {image && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">📸 촬영된 사진</h3>
              <img src={image || "/placeholder.svg"} alt="캡처된 이미지" className="w-full border rounded-lg" />
            </div>
          )}

          {response?.result?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">🔍 얼굴 인식 결과</h3>
              <canvas ref={canvasRef} className="w-full border rounded-lg" />
            </div>
          )}
        </div>
      </div>

      {/* 커스텀 알림 대화상자 */}
      {showRegisterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">신규 사용자 감지</h3>
            <p className="mb-4 text-gray-600">
              얼굴 인식 결과, 등록되지 않은 신규 사용자로 확인되었습니다. 사용자 등록을 진행하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRegisterDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleRegister}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
