import { createMember, getMember, getMembers } from "@/api/members";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import FaceDetectionResult from "@/interfaces/FaceRecognitionResult";
import {
  disconnectLocalServer,
  isLocalServerConnected,
  offLocalServerMessage,
  onLocalServerMessage,
  sendToLocalServer,
} from "@/services/websocketService";
import { useCallback, useEffect, useRef, useState } from "react";

function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentMember, setCurrentMember } = useCurrentMember();
  const isProcessingRef = useRef<boolean>(false);
  const processingTimeoutRef = useRef<number | null>(null);
  const connectionCheckInterval = useRef<number | null>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Move member update logic to a stable callback
  const updateMember = useCallback(
    async (identity: string) => {
      try {
        // 1. Create new member
        await createMember({
          member_id: identity,
          age: 0,
          image_path: "null",
        });

        // 2. Fetch updated members list
        await getMembers();

        // 3. Fetch the specific member details
        await getMember(identity);

        // Only update if the member changed
        if (currentMember?.member_id !== identity) {
          setCurrentMember(identity);
        }
      } catch (error) {
        console.error("Failed to create or update member:", error);
      }
    },
    [currentMember, setCurrentMember]
  );

  useEffect(() => {
    // Create a temporary canvas for image resizing
    tempCanvasRef.current = document.createElement("canvas");
    tempCanvasRef.current.width = 320; // Half size
    tempCanvasRef.current.height = 240; // Half size

    return () => {
      tempCanvasRef.current = null;
    };
  }, []);

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
    };
  }, []);

  useEffect(() => {
    // Handle face recognition results
    const handleFaceRecognition = async (result: FaceDetectionResult) => {
      // Clear the processing timeout since we got a response
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }

      console.log("[WebSocket] Received face recognition response:", new Date().toISOString());

      if (result.result.length > 0) {
        const { identity } = result.result[0];

        // Update member only if different
        if (currentMember?.member_id !== identity) {
          await updateMember(identity);
        }

        // Always draw face box if coordinates are available
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
            ctx.strokeRect(
              face.target_x * (canvas.width / 320), // Scale back up
              face.target_y * (canvas.height / 240),
              face.target_w * (canvas.width / 320),
              face.target_h * (canvas.height / 240)
            );

            // Optional: Add debug info
            console.log("[Face Box] Updated position:", {
              x: face.target_x,
              y: face.target_y,
              w: face.target_w,
              h: face.target_h,
            });
          }
        }
      } else {
        // No face detected, clear the box
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
        }
      }

      // Mark processing as complete and send next frame
      isProcessingRef.current = false;

      // Small delay before sending next frame to prevent overwhelming
      setTimeout(sendNextFrame, 100);
    };

    // Function to send the next frame
    const sendNextFrame = () => {
      // Don't send if already processing
      if (isProcessingRef.current) return;

      // Don't send if not connected
      if (!isLocalServerConnected()) {
        return;
      }

      const video = videoRef.current;
      const tempCanvas = tempCanvasRef.current;
      if (video && tempCanvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = tempCanvas.getContext("2d");
        if (ctx) {
          // Draw current video frame at reduced size
          ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

          // Get frame data as base64 with reduced quality
          const frameData = tempCanvas.toDataURL("image/jpeg", 0.6).split(",")[1];

          // Mark as processing and send frame
          isProcessingRef.current = true;

          // Set a timeout to handle cases where we don't get a response
          processingTimeoutRef.current = window.setTimeout(() => {
            console.log(
              "[WebSocket] Frame processing timeout, resetting state...",
              new Date().toISOString()
            );
            isProcessingRef.current = false;
            sendNextFrame();
          }, 5000); // 5 second timeout

          console.log("[WebSocket] Sending frame to server:", new Date().toISOString());
          sendToLocalServer(frameData);
        }
      }
    };

    // Function to check connection and start sending frames
    const checkConnectionAndStart = () => {
      if (isLocalServerConnected() && !isProcessingRef.current) {
        sendNextFrame();
      }
    };

    // Register WebSocket message handler
    onLocalServerMessage(handleFaceRecognition);

    // Start checking for connection and periodically check
    checkConnectionAndStart();
    connectionCheckInterval.current = window.setInterval(checkConnectionAndStart, 500);

    // Cleanup
    return () => {
      offLocalServerMessage(handleFaceRecognition);
      if (connectionCheckInterval.current) {
        window.clearInterval(connectionCheckInterval.current);
      }
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
      }
      disconnectLocalServer();
    };
  }, []); // Remove dependencies that cause re-renders

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
