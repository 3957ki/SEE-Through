import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

export default function FaceRecognition() {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [ws, setWs] = useState(null);
  const [response, setResponse] = useState(null);
  const [recognizedUser, setRecognizedUser] = useState(null);

  // 웹소켓 연결
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:9000/vision/find_faces/");

    socket.onopen = () => {
      console.log("WebSocket 연결됨");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("웹소켓 응답:", data);
      setResponse(data);

      if (data.result && data.result.length === 0) {
        setRecognizedUser(null);
      } else if (data.result && data.result.length > 0) {
        setRecognizedUser(data.result[0].identity);
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

      // WebSocket을 통해 JSON 형태로 이미지 전송
      if (ws && ws.readyState === WebSocket.OPEN) {
        const payload = {
          image: base64Image,
          level: 2,
          uuid: null, // 필요 시 uuid를 여기에 추가 가능
        };
        ws.send(JSON.stringify(payload));
      }
    };
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
    </div>
  );
}
