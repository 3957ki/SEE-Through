import { createAndGetMember, getMember, getMembers } from "@/api/members";
import { useCurrentMember } from "@/contexts/CurrentMemberContext";
import { useMembers } from "@/contexts/MembersContext";
import {
  disconnectLocalServer,
  isLocalServerConnected,
  offLocalServerMessage,
  onLocalServerMessage,
  sendToLocalServer,
} from "@/services/websocketService";
import { BoundingBox, FaceDetector, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const SMALL_FACE_CUT = 20000;
const LARGE_FACE_CUT = 40000;
const IOU_CUT = 0.5;

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

  // mediapipe 관련
  const [faceDetector, setFaceDetector] = useState<FaceDetector | null>(null);
  const requestRef = useRef<number>(0);
  const prevBoundingBoxRef = useRef<BoundingBox | null>(null);

  // 현재 얼굴 레벨
  const [faceLevel, setFaceLevel] = useState<{ level: number; cut: number }>({
    level: 0,
    cut: SMALL_FACE_CUT,
  });
  const faceLevelRef = useRef<{ level: number; cut: number }>({
    level: 0,
    cut: SMALL_FACE_CUT,
  });
  const updateFaceLevel = (newLevel: { level: number; cut: number }) => {
    faceLevelRef.current = newLevel;
    setFaceLevel(newLevel);
  };

  // 얼굴 레벨 변경에 따른 Ref
  const level1LogIntervalRef = useRef<number | null>(null);
  const hasLoggedLevel2Ref = useRef(false);

  // IOU 계산 함수
  const calculateIOU = (boxA: BoundingBox, boxB: BoundingBox): number => {
    const xA = Math.max(boxA.originX, boxB.originX);
    const yA = Math.max(boxA.originY, boxB.originY);
    const xB = Math.min(boxA.originX + boxA.width, boxB.originX + boxB.width);
    const yB = Math.min(boxA.originY + boxA.height, boxB.originY + boxB.height);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const boxAArea = boxA.width * boxA.height;
    const boxBArea = boxB.width * boxB.height;

    return interArea / (boxAArea + boxBArea - interArea);
  };

  // 얼굴 레벨 상태 변경 시 로직
  const handleFaceLevelChange = (newLevel: number) => {
    // 레벨 0: 로그, 타이머 정리, 2 로그 상태 초기화
    if (newLevel === 0) {
      console.log("[레벨 0] 얼굴 없음");
      setCurrentMemberRef.current(null);

      if (level1LogIntervalRef.current) {
        clearInterval(level1LogIntervalRef.current);
        level1LogIntervalRef.current = null;
      }
      hasLoggedLevel2Ref.current = false;
    }

    // 레벨 1: interval 로 주기적 로그, 2 로그 상태 초기화
    else if (newLevel === 1) {
      if (!level1LogIntervalRef.current && isLocalServerConnected()) {
        console.log("[레벨 1] 요청 시작");

        const uuid = currentMemberRef.current?.member_id ?? null;
        sendNextFrame(newLevel, uuid);
      }
      hasLoggedLevel2Ref.current = false;
    }

    // 레벨 2: 로그는 딱 한 번만 출력, 타이머 정리 (IOU 값에 따른 요청 분기로 수정 예정)
    else if (newLevel === 2) {
      if (!hasLoggedLevel2Ref.current) {
        console.log("[레벨 2] 요청");

        // const uuid = currentMemberRef.current?.member_id ?? null;
        // sendNextFrame(newLevel, uuid);
        hasLoggedLevel2Ref.current = true;
      }

      if (level1LogIntervalRef.current) {
        clearInterval(level1LogIntervalRef.current);
        level1LogIntervalRef.current = null;
      }
    }
  };

  // 이미지 요청 보내는 함수
  function sendNextFrame(level: number, uuid: any) {
    if (isProcessingRef.current || !isLocalServerConnected() || faceLevelRef.current.level !== 1) {
      return;
    }

    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = VIDEO_WIDTH;
      tempCanvas.height = VIDEO_HEIGHT;
      const tempCtx = tempCanvas.getContext("2d");

      if (tempCtx) {
        tempCtx.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        lastProcessedFrameRef.current = tempCtx.getImageData(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        const frameData = tempCanvas.toDataURL("image/jpeg", 0.6).split(",")[1];

        isProcessingRef.current = true;

        processingTimeoutRef.current = window.setTimeout(() => {
          console.warn("[WebSocket] 응답 타임아웃");
          isProcessingRef.current = false;
          sendNextFrame(level, uuid); // timeout 후에도 계속 시도
        }, 5000);

        sendToLocalServer({ image: frameData, level: level, uuid: uuid });
      }
    }
  }

  // 웹캠 인식 시작
  useEffect(() => {
    const detectLoop = async () => {
      try {
        if (!faceDetector || !videoRef.current || !overlayCanvasRef.current) {
          requestRef.current = requestAnimationFrame(detectLoop);
          return;
        }

        // 미디어파이프 인식 결과
        const detections = faceDetector.detectForVideo(videoRef.current, performance.now());

        let currentBox: BoundingBox | null = null;
        let iouText = "";
        // 현재 상태를 지역 변수로 가져오기
        const currentLevel = faceLevelRef.current.level;
        const currentCut = currentLevel === 1 ? LARGE_FACE_CUT : SMALL_FACE_CUT;
        let nextFaceLevel = faceLevel;

        // 인식된 얼굴이 있다면
        if (detections.detections.length > 0) {
          const largestDetection = detections.detections.reduce((largest, current) => {
            const largestBox = largest.boundingBox;
            const currentBox = current.boundingBox;
            if (!largestBox || !currentBox) return largest;
            const largestArea = largestBox.width * largestBox.height;
            const currentArea = currentBox.width * currentBox.height;
            return currentArea > largestArea ? current : largest;
          }, detections.detections[0]);

          currentBox = largestDetection.boundingBox ?? null;

          if (currentBox) {
            const area = currentBox.width * currentBox.height;

            // 동기적으로 cut 판단
            if (area >= currentCut) {
              nextFaceLevel = { level: 2, cut: SMALL_FACE_CUT };
            } else {
              nextFaceLevel = { level: 1, cut: LARGE_FACE_CUT };
            }
          }

          const prevBox = prevBoundingBoxRef.current;
          if (currentBox && prevBox) {
            const iou = calculateIOU(currentBox, prevBox);
            iouText = `IOU: ${iou.toFixed(2)}`;

            if (iou < IOU_CUT) {
              console.log("[IOU] 낮은 IOU 감지됨:", iou.toFixed(2));
            }
          }

          prevBoundingBoxRef.current = currentBox;
        } else {
          nextFaceLevel = { level: 0, cut: SMALL_FACE_CUT };
          prevBoundingBoxRef.current = null;
        }

        if (nextFaceLevel.level !== faceLevelRef.current.level) {
          updateFaceLevel(nextFaceLevel);
          handleFaceLevelChange(nextFaceLevel.level);
        }

        // 캔버스에 그리기
        const ctx = overlayCanvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

          // 배경 비디오 프레임 그리기
          if (videoRef.current) {
            ctx.drawImage(videoRef.current, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
          }

          // 얼굴 박스 및 IOU 텍스트 그리기
          if (currentBox) {
            const { originX, originY, width, height } = currentBox;

            let boxColor = "#cccccc"; // 기본
            if (nextFaceLevel.level === 1)
              boxColor = "#ff0000"; // 빨강
            else if (nextFaceLevel.level === 2) boxColor = "#00ff00"; // 초록

            ctx.strokeStyle = boxColor;

            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.strokeRect(originX, originY, width, height);

            ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
            ctx.fillRect(originX, originY - 40, 120, 40);
            ctx.fillStyle = "#000000";
            ctx.font = "14px Arial";
            ctx.fillText("얼굴 감지됨", originX + 5, originY - 25);
            if (iouText) {
              ctx.fillText(iouText, originX + 5, originY - 10);
            }
          }
        }
      } catch (e) {
        console.error("[MediaPipe] Face detection error:", e);
      }

      requestRef.current = requestAnimationFrame(detectLoop);
    };

    requestRef.current = requestAnimationFrame(detectLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [faceDetector]);

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
        // 비디오가 메타데이터를 로드했을 때 이벤트 리스너
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch((err) => {
              console.error("비디오 재생 실패:", err);
              setError("비디오 재생 실패: " + err.message);
            });
          }
        };
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
    if (level1LogIntervalRef.current) {
      clearInterval(level1LogIntervalRef.current);
      level1LogIntervalRef.current = null;
    }
    disconnectLocalServer();
  };

  useEffect(() => {
    const runInitAndLoad = async () => {
      try {
        await init(); // 먼저 웹캠 시작

        // 최신 WASM 경로로 수정
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const detector = await FaceDetector.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
        });

        setFaceDetector(detector);

        console.log("[MediaPipe] Face detector loaded successfully");
      } catch (err) {
        console.error("[MediaPipe] Setup error:", err);
        setError("MediaPipe 설정 오류: " + (err as Error).message);
      }
    };

    runInitAndLoad();
    return cleanup;
  }, []);

  // 얼굴 레벨에 따른 기능
  useEffect(() => {
    let shouldContinue = true;

    // 웹소켓 메시지 핸들러
    async function handleFaceRecognition(result: any) {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }

      console.log("[WebSocket] 응답 수신:", result);

      const isNew = result?.is_new;
      const detected = result?.result?.[0];
      const memberId = detected?.identity;

      // 새로운 아이디라면
      if (isNew) {
        try {
          // 신규 등록하기
          const newMember = await createAndGetMember({
            member_id: memberId,
            age: 0,
            image_path: "null",
          });
          const members = await getMembers();
          setMembersRef.current(members);
          setCurrentMemberRef.current(newMember);
        } catch (err) {
          console.error("[WebSocket] 멤버 업데이트 실패:", err);
        }
      }

      // 새로운 아이디가 아닌데 현재 멤버 아이디와 다를 때
      else if (memberId && currentMemberRef.current?.member_id !== memberId) {
        try {
          // 인식된 멤버가 있을때 가져오기만 함
          const newMember = await getMember(memberId);
          setCurrentMemberRef.current(newMember);
        } catch (err) {
          console.error("[WebSocket] 멤버 업데이트 실패:", err);
        }
      }

      // 1단계인데 직전 멤버 id가 존재하고 현재 인식 결과가 없을 때 회원을 null로 갱신
      else if (
        faceLevelRef.current.level === 1 &&
        currentMemberRef.current?.member_id &&
        !memberId
      ) {
        setCurrentMemberRef.current(null);
      }

      isProcessingRef.current = false;

      // 레벨 1이라면 다음 프레임 0.1초 후 전송
      if (shouldContinue && faceLevelRef.current.level === 1) {
        setTimeout(() => {
          if (shouldContinue && faceLevelRef.current.level === 1) {
            sendNextFrame(1, null);
          }
        }, 100);
      }
    }

    onLocalServerMessage(handleFaceRecognition);

    return () => {
      shouldContinue = false;
      offLocalServerMessage(handleFaceRecognition);
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  // useEffect(() => {
  //   async function handleFaceRecognition(result: FaceDetectionResult) {
  //     // Clear the processing timeout since we got a response
  //     if (processingTimeoutRef.current) {
  //       window.clearTimeout(processingTimeoutRef.current);
  //       processingTimeoutRef.current = null;
  //     }

  //     console.log("[WebSocket] Received face recognition response:", new Date().toISOString());
  //     console.log("[Face Detection] Result:", result);

  //     // Draw the frame that was processed
  //     if (lastProcessedFrameRef.current && videoCanvasRef.current) {
  //       const ctx = videoCanvasRef.current.getContext("2d");
  //       if (ctx) {
  //         // Clear and put the new frame data directly
  //         ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
  //         ctx.putImageData(lastProcessedFrameRef.current, 0, 0);

  //         // Draw face box if face detected
  //         if (result.result && result.result.length > 0) {
  //           const { identity: memberId } = result.result[0];
  //           console.log("[Face Detection] Detected member:", memberId);

  //           // 현재 멤버랑 다른 경우에만 업데이트하기
  //           if (currentMemberRef.current?.member_id !== memberId) {
  //             (async () => {
  //               try {
  //                 // 1. Create new member
  //                 const newMember = await createAndGetMember({
  //                   member_id: memberId,
  //                   age: 0,
  //                   image_path: "null",
  //                 });

  //                 // 2. Update members
  //                 const members = await getMembers();
  //                 setMembers(members);

  //                 // 3. Set current member
  //                 setCurrentMember(newMember);
  //               } catch (error) {
  //                 console.error("Failed to create or update member:", error);
  //               }
  //             })();
  //           }

  //           // 박스 그리기
  //           const face = result.result[0];
  //           console.log("[Face Box] Drawing box with coordinates:", {
  //             x: face.source_x,
  //             y: face.source_y,
  //             w: face.source_w,
  //             h: face.source_h,
  //           });

  //           if (
  //             typeof face.source_x === "number" &&
  //             typeof face.source_y === "number" &&
  //             typeof face.source_w === "number" &&
  //             typeof face.source_h === "number"
  //           ) {
  //             // Draw face box with yellow color
  //             ctx.beginPath();
  //             ctx.strokeStyle = "#ffff00"; // Yellow box
  //             ctx.lineWidth = 3;
  //             ctx.strokeRect(face.source_x, face.source_y, face.source_w, face.source_h);

  //             console.log("[Face Box] Box drawn successfully");
  //           }
  //         }

  //         // Clear the stored frame after drawing
  //         lastProcessedFrameRef.current = null;

  //         // Mark processing as complete and send next frame
  //         isProcessingRef.current = false;
  //         sendNextFrame();
  //       }
  //     } else {
  //       // If no frame was stored, just send next frame
  //       isProcessingRef.current = false;
  //       sendNextFrame();
  //     }
  //   }

  //   function sendNextFrame() {
  //     // Don't send if already processing
  //     if (isProcessingRef.current) {
  //       console.log("[Frame] Skipping send - already processing");
  //       return;
  //     }

  //     // Don't send if not connected
  //     if (!isLocalServerConnected()) {
  //       console.log("[Frame] Skipping send - not connected");
  //       return;
  //     }

  //     const video = videoRef.current;
  //     if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
  //       // Create a temporary canvas for frame extraction
  //       const tempCanvas = document.createElement("canvas");
  //       tempCanvas.width = VIDEO_WIDTH;
  //       tempCanvas.height = VIDEO_HEIGHT;
  //       const tempCtx = tempCanvas.getContext("2d");

  //       if (tempCtx) {
  //         // Draw current video frame to temporary canvas
  //         tempCtx.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  //         // Store the frame data as ImageData
  //         lastProcessedFrameRef.current = tempCtx.getImageData(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

  //         // Convert ImageData to base64 for sending
  //         const frameData = tempCanvas.toDataURL("image/jpeg", 0.6).split(",")[1];

  //         // Mark as processing and send frame
  //         isProcessingRef.current = true;

  //         // Set a timeout to handle cases where we don't get a response
  //         processingTimeoutRef.current = window.setTimeout(() => {
  //           console.log(
  //             "[WebSocket] Frame processing timeout, resetting state...",
  //             new Date().toISOString()
  //           );
  //           isProcessingRef.current = false;
  //           sendNextFrame();
  //         }, 5000); // 5 second timeout

  //         console.log("[WebSocket] Sending frame to server:", new Date().toISOString());
  //         sendToLocalServer({ image: frameData, level: 1, uuid: null });
  //       }
  //     } else {
  //       console.log("[Frame] Skipping send - video not ready");
  //     }
  //   }

  //   // Function to check connection and start sending frames
  //   const checkConnectionAndStart = () => {
  //     if (isLocalServerConnected() && !isProcessingRef.current) {
  //       sendNextFrame();
  //     }
  //   };

  //   // Register WebSocket message handler
  //   onLocalServerMessage(handleFaceRecognition);

  //   // Start checking for connection and periodically check
  //   checkConnectionAndStart();
  //   connectionCheckIntervalRef.current = window.setInterval(checkConnectionAndStart, 500);

  //   // Cleanup
  //   return () => {
  //     // offLocalServerMessage(handleFaceRecognition);
  //     if (connectionCheckIntervalRef.current) {
  //       window.clearInterval(connectionCheckIntervalRef.current);
  //     }
  //     if (processingTimeoutRef.current) {
  //       window.clearTimeout(processingTimeoutRef.current);
  //     }
  //     disconnectLocalServer();
  //   };
  // }, []); // Remove dependencies that cause re-renders

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
