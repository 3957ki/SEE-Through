import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

export default function FaceRecognition() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [ws, setWs] = useState(null);
  const [response, setResponse] = useState(null);
  const [registerResponse, setRegisterResponse] = useState(null);
  const [metadataResponse, setMetadataResponse] = useState(null);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [recognizedUser, setRecognizedUser] = useState(null);

  // 웹소켓 연결
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:9000/find_faces/");

    socket.onopen = () => {
      console.log("WebSocket 연결됨");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("웹소켓 응답:", data);
      setResponse(data);

      if (data.result && data.result.length === 0) {
        setShowRegisterDialog(true);
        setRecognizedUser(null);
      } else if (data.result && data.result.length > 0) {
        setRecognizedUser(data.result[0].identity);
        setShowRegisterDialog(false);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket 오류:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket 연결 종료됨");
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();

    // 좌우 반전 적용
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];
      setImage(base64Image);

      // WebSocket을 통해 서버에 이미지 전송
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(base64Image);
      }
    };
  };

  const handleRegister = async () => {
    if (!image) {
      alert("사진을 먼저 촬영하세요.");
      return;
    }

    const blob = await fetch(`data:image/jpeg;base64,${image}`).then((res) => res.blob());
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

    const blob = await fetch(`data:image/jpeg;base64,${image}`).then((res) => res.blob());
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:9000/analyze_user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMetadataResponse(res.data);
    } catch (error) {
      console.error("메타데이터 요청 실패:", error);
      setMetadataResponse("메타데이터 요청 실패");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">실시간 얼굴 인증 시스템</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <div className="mb-6 border rounded-lg overflow-hidden">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" mirrored={true} className="w-full" />
          </div>

          <div className="flex gap-4 mb-6">
            <button onClick={capture} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              사진 촬영 및 인증
            </button>
            <button
              onClick={handleRegister}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              사용자 등록
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
                <h4 className="font-medium text-green-800">사용자 인증 완료</h4>
                <p className="text-green-700">환영합니다, {recognizedUser} 님!</p>
              </div>
            </div>
          )}

          {response && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg overflow-auto">
              <h3 className="text-lg font-semibold mb-2">📌 얼굴 인증 응답:</h3>
              <pre className="text-sm">{JSON.stringify(response, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      {showRegisterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-2">신규 사용자 감지</h3>
            <p className="mb-4 text-gray-600">
              얼굴 인증 결과, 등록되지 않은 신규 사용자로 확인되었습니다. 사용자 등록을 진행하시겠습니까?
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
