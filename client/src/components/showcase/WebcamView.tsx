import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import FaceDetectionResult from "@/interfaces/FaceRecognitionResult";
import {
  offLocalServerMessage,
  onLocalServerMessage,
  sendToLocalServer,
} from "@/services/websocketService";
import { useEffect, useRef, useState } from "react";

function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamInterval = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentMember } = useCurrentMember();

  useEffect(() => {
    // Start webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        setError("웹캠을 시작할 수 없습니다: " + err.message);
        console.error("Failed to start webcam:", err);
      });

    // Capture ref value for cleanup
    const videoElement = videoRef.current;

    // Cleanup function
    return () => {
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      if (streamInterval.current) {
        window.clearInterval(streamInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    // Handle face recognition results
    const handleFaceRecognition = (result: FaceDetectionResult) => {
      if (result.result.length > 0) {
        const { identity } = result.result[0];

        // Update current member
        setCurrentMember(identity);

        // Draw face box if coordinates are available
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const face = result.result[0];
        if (
          canvas &&
          video &&
          typeof face.target_x === "number" &&
          typeof face.target_y === "number" &&
          typeof face.target_w === "number" &&
          typeof face.target_h === "number"
        ) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Clear previous drawing
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the current video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Draw face box
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 2;
            ctx.strokeRect(face.target_x, face.target_y, face.target_w, face.target_h);
          }
        }
      }
    };

    // Register WebSocket message handler
    onLocalServerMessage(handleFaceRecognition);

    // Start sending frames
    streamInterval.current = window.setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Draw current video frame
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Get frame data as base64
          const frameData = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

          // Send to server
          console.log("Sending frame to server...");
          sendToLocalServer(frameData);
        }
      }
    }, 1000);

    // Cleanup
    return () => {
      offLocalServerMessage(handleFaceRecognition);
      if (streamInterval.current) {
        window.clearInterval(streamInterval.current);
      }
    };
  }, [setCurrentMember]);

  if (error) {
    return (
      <div className="bg-black rounded-md w-full h-full flex items-center justify-center">
        <p className="text-red-400 text-center text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-black rounded-md w-full h-full flex items-center justify-center relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0 }}
      />
      <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover" />
    </div>
  );
}

export default WebcamView;
