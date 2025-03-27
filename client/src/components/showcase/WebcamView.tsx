import { createAndGetMember, getMembers } from "@/api/members";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useMembers } from "@/contexts/MembersContext";
import FaceDetectionResult from "@/interfaces/FaceRecognitionResult";
import {
  disconnectLocalServer,
  isLocalServerConnected,
  offLocalServerMessage,
  onLocalServerMessage,
  sendToLocalServer,
} from "@/services/websocketService";
import { useEffect, useRef, useState } from "react";

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastProcessedFrameRef = useRef<ImageData | null>(null);
  const isInitializedRef = useRef(false);

  // 웹캠 관련 에러 메시지
  const [error, setError] = useState<string | null>(null);

  // 멤버 관련 상태
  const { setMembers } = useMembers();
  const { currentMember, setCurrentMember } = useCurrentMember();

  // Member refs for callbacks
  const currentMemberRef = useRef(currentMember);
  const setMembersRef = useRef(setMembers);
  const setCurrentMemberRef = useRef(setCurrentMember);

  // Frame sending control
  const isProcessingRef = useRef<boolean>(false);
  const processingTimeoutRef = useRef<number | null>(null);
  const connectionCheckIntervalRef = useRef<number | null>(null);

  // Update refs when values change
  useEffect(() => {
    currentMemberRef.current = currentMember;
    setMembersRef.current = setMembers;
    setCurrentMemberRef.current = setCurrentMember;
  }, [currentMember, setMembers, setCurrentMember]);

  const init = async () => {
    if (isInitializedRef.current) return;

    try {
      // Start webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Setup canvases
      const videoCanvas = videoCanvasRef.current;
      const overlayCanvas = overlayCanvasRef.current;
      if (videoCanvas && overlayCanvas) {
        const ctx = videoCanvas.getContext("2d");
        const overlayCtx = overlayCanvas.getContext("2d");
        if (ctx && overlayCtx) {
          // Set canvas dimensions to match video
          videoCanvas.width = VIDEO_WIDTH;
          videoCanvas.height = VIDEO_HEIGHT;
          overlayCanvas.width = VIDEO_WIDTH;
          overlayCanvas.height = VIDEO_HEIGHT;

          // Configure contexts for crisp rendering
          ctx.imageSmoothingEnabled = false;
          overlayCtx.imageSmoothingEnabled = false;
          console.log("[Canvas] Canvas dimensions set:", {
            width: videoCanvas.width,
            height: videoCanvas.height,
          });
        }
      }

      isInitializedRef.current = true;
    } catch (err) {
      setError("웹캠을 시작할 수 없습니다: " + (err as Error).message);
      console.error("Failed to start webcam:", err);
    }
  };

  const cleanup = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    if (connectionCheckIntervalRef.current) {
      window.clearInterval(connectionCheckIntervalRef.current);
    }
    if (processingTimeoutRef.current) {
      window.clearTimeout(processingTimeoutRef.current);
    }
    disconnectLocalServer();
  };

  useEffect(() => {
    init();
    return cleanup;
  }, []);

  useEffect(() => {
    async function handleFaceRecognition(result: FaceDetectionResult) {
      // Clear the processing timeout since we got a response
      if (processingTimeoutRef.current) {
        window.clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }

      console.log("[WebSocket] Received face recognition response:", new Date().toISOString());
      console.log("[Face Detection] Result:", result);

      // Draw the frame that was processed
      if (lastProcessedFrameRef.current && videoCanvasRef.current) {
        const ctx = videoCanvasRef.current.getContext("2d");
        if (ctx) {
          // Clear and put the new frame data directly
          ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
          ctx.putImageData(lastProcessedFrameRef.current, 0, 0);

          // Draw face box if face detected
          if (result.result && result.result.length > 0) {
            const { identity: memberId } = result.result[0];
            console.log("[Face Detection] Detected member:", memberId);

            // 현재 멤버랑 다른 경우에만 업데이트하기
            if (currentMemberRef.current?.member_id !== memberId) {
              (async () => {
                try {
                  // 1. Create new member
                  const newMember = await createAndGetMember({
                    member_id: memberId,
                    age: 0,
                    image_path: "null",
                  });

                  // 2. Update members
                  const members = await getMembers();
                  setMembers(members);

                  // 3. Set current member
                  setCurrentMember(newMember);
                } catch (error) {
                  console.error("Failed to create or update member:", error);
                }
              })();
            }

            // 박스 그리기
            const face = result.result[0];
            console.log("[Face Box] Drawing box with coordinates:", {
              x: face.source_x,
              y: face.source_y,
              w: face.source_w,
              h: face.source_h,
            });

            if (
              typeof face.source_x === "number" &&
              typeof face.source_y === "number" &&
              typeof face.source_w === "number" &&
              typeof face.source_h === "number"
            ) {
              // Draw face box with yellow color
              ctx.beginPath();
              ctx.strokeStyle = "#ffff00"; // Yellow box
              ctx.lineWidth = 3;
              ctx.strokeRect(face.source_x, face.source_y, face.source_w, face.source_h);

              console.log("[Face Box] Box drawn successfully");
            }
          }

          // Clear the stored frame after drawing
          lastProcessedFrameRef.current = null;

          // Mark processing as complete and send next frame
          isProcessingRef.current = false;
          sendNextFrame();
        }
      } else {
        // If no frame was stored, just send next frame
        isProcessingRef.current = false;
        sendNextFrame();
      }
    }

    function sendNextFrame() {
      // Don't send if already processing
      if (isProcessingRef.current) {
        console.log("[Frame] Skipping send - already processing");
        return;
      }

      // Don't send if not connected
      if (!isLocalServerConnected()) {
        console.log("[Frame] Skipping send - not connected");
        return;
      }

      const video = videoRef.current;
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        // Create a temporary canvas for frame extraction
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = VIDEO_WIDTH;
        tempCanvas.height = VIDEO_HEIGHT;
        const tempCtx = tempCanvas.getContext("2d");

        if (tempCtx) {
          // Draw current video frame to temporary canvas
          tempCtx.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

          // Store the frame data as ImageData
          lastProcessedFrameRef.current = tempCtx.getImageData(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

          // Convert ImageData to base64 for sending
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
      } else {
        console.log("[Frame] Skipping send - video not ready");
      }
    }

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
    connectionCheckIntervalRef.current = window.setInterval(checkConnectionAndStart, 500);

    // Cleanup
    return () => {
      offLocalServerMessage(handleFaceRecognition);
      if (connectionCheckIntervalRef.current) {
        window.clearInterval(connectionCheckIntervalRef.current);
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
      <canvas
        ref={videoCanvasRef}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        className="w-full h-full object-cover"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
      <canvas
        ref={overlayCanvasRef}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        className="w-full h-full object-cover"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}

export default WebcamView;
