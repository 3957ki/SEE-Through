import { createAndGetMember } from "@/api/members";
import { useCurrentMemberId } from "@/contexts/CurrentMemberIdContext";
import {
  disconnectLocalServer,
  initLocalServerWebSocket,
  isLocalServerConnected,
  offLocalServerMessage,
  onLocalServerMessage,
  sendToLocalServer,
} from "@/services/websocketService";
import { BoundingBox, FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";

// 고정 변수
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const SMALL_FACE_CUT = 8000;
const LARGE_FACE_CUT = 15000;
const IOU_CUT = 0.9;
const MIN_FACE_ANGLE_THRESHOLD = 0.15;
const MIN_FACE_VERTICAL_THRESHOLD = 0.15;
const EDGE_MARGIN = 40;

interface WebcamViewProps {
  onActivateScreensaver: () => void;
  onDeactivateScreensaver: () => void;
}

function WebcamView({ onActivateScreensaver, onDeactivateScreensaver }: WebcamViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastProcessedFrameRef = useRef<ImageData | null>(null);
  const isInitializedRef = useRef(false);

  // 멤버 관련
  const { currentMemberId, setCurrentMemberId } = useCurrentMemberId();

  // 웹캠 관련 에러 메시지
  const [error, setError] = useState<string | null>(null);

  // 연결 상태 관련
  const processingTimeoutRef = useRef<number | null>(null);
  const connectionCheckIntervalRef = useRef<number | null>(null);

  // 요청 큐
  const requestQueue = useRef<{
    pending: boolean;
    nextRequest: null | { level: number; uuid: any };
  }>({
    pending: false,
    nextRequest: null,
  });

  // 마지막 레벨 0 전환 시간을 추적
  const lastLevelZeroTimeRef = useRef<number | null>(null);

  // 캔버스 관련
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    tempCanvasRef.current = document.createElement("canvas");
    tempCanvasRef.current.width = VIDEO_WIDTH;
    tempCanvasRef.current.height = VIDEO_HEIGHT;

    return () => {
      tempCanvasRef.current = null;
    };
  }, []);

  // mediapipe 관련
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const prevBoundingBoxRef = useRef<BoundingBox | null>(null);

  // 현재 얼굴 레벨
  const [faceLevel, setFaceLevel] = useState<{ level: number; cut: number }>({
    level: 0,
    cut: LARGE_FACE_CUT,
  });
  const faceLevelRef = useRef<{ level: number; cut: number }>({
    level: 0,
    cut: LARGE_FACE_CUT,
  });
  const updateFaceLevel = (newLevel: { level: number; cut: number }) => {
    faceLevelRef.current = newLevel;
    setFaceLevel(newLevel);
  };

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

  // 얼굴이 정면을 향하고 있는지 확인하는 함수
  const isFacingFront = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return false;

    // 눈의 위치 추출
    // 왼쪽 눈 바깥쪽, 안쪽 꼭지점
    const leftEyeOuter = landmarks[0][33]; // 왼쪽 눈 바깥쪽 좌표
    const leftEyeInner = landmarks[0][133]; // 왼쪽 눈 안쪽 좌표

    // 오른쪽 눈 안쪽, 바깥쪽 꼭지점
    const rightEyeInner = landmarks[0][362]; // 오른쪽 눈 안쪽 좌표
    const rightEyeOuter = landmarks[0][263]; // 오른쪽 눈 바깥쪽 좌표

    // 상하 방향 확인을 위한 추가 랜드마크
    const noseTop = landmarks[0][1]; // 코 윗부분
    const noseTip = landmarks[0][4]; // 코끝
    const foreHead = landmarks[0][10]; // 이마 중앙
    const chin = landmarks[0][152]; // 턱 중앙

    // 왼쪽 눈 너비
    const leftEyeWidth = Math.sqrt(
      Math.pow(leftEyeOuter.x - leftEyeInner.x, 2) + Math.pow(leftEyeOuter.y - leftEyeInner.y, 2)
    );

    // 오른쪽 눈 너비
    const rightEyeWidth = Math.sqrt(
      Math.pow(rightEyeOuter.x - rightEyeInner.x, 2) +
        Math.pow(rightEyeOuter.y - rightEyeInner.y, 2)
    );

    // 두 눈의 너비 차이가 크면 얼굴이 돌아간 것
    const eyeWidthDiff =
      Math.abs(leftEyeWidth - rightEyeWidth) / Math.max(leftEyeWidth, rightEyeWidth);

    // 상하 기울임 확인
    // 코 - 이마 길이
    const noseToForeheadDist = Math.sqrt(
      Math.pow(noseTop.x - foreHead.x, 2) + Math.pow(noseTop.y - foreHead.y, 2)
    );

    // 코 - 턱 길이
    const noseToChinDist = Math.sqrt(
      Math.pow(noseTip.x - chin.x, 2) + Math.pow(noseTip.y - chin.y, 2)
    );

    // 이상적인 상황에서는 코가 이마와 턱 사이의 중간쯤에 위치
    // 비율이 크게 차이나면 고개를 숙이거나 들고 있는 것
    const verticalRatio = noseToForeheadDist / noseToChinDist;
    const isVerticallyAligned = Math.abs(verticalRatio - 1) < MIN_FACE_VERTICAL_THRESHOLD;

    // 좌우와 상하 모두 확인하여 정면 여부 판단
    return eyeWidthDiff < MIN_FACE_ANGLE_THRESHOLD && isVerticallyAligned;
  };

  // 얼굴이 화면 가장자리에 너무 가까운지 확인하는 함수
  const isFaceTooCloseToEdge = (box: BoundingBox): boolean => {
    return (
      box.originX < EDGE_MARGIN ||
      box.originY < EDGE_MARGIN ||
      box.originX + box.width > VIDEO_WIDTH - EDGE_MARGIN ||
      box.originY + box.height > VIDEO_HEIGHT - EDGE_MARGIN
    );
  };

  // 얼굴 레벨 상태 변경 시 로직
  const handleFaceLevelChange = (newLevel: number) => {
    // 레벨 0: 로그, 타이머 정리, 2 로그 상태 초기화
    if (newLevel === 0) {
      console.log("[레벨 0] 얼굴 없음");
      setCurrentMemberId("");
    }

    // 레벨 1: 주기적 요청, 2 로그 상태 초기화
    else if (newLevel === 1) {
      if (isLocalServerConnected()) {
        console.log("[레벨 1] 요청 시작");
        sendNextFrame(newLevel, null);
      }
    }

    // 레벨 2: 로그는 딱 한 번만 출력, 타이머 정리
    else if (newLevel === 2) {
      if (isLocalServerConnected()) {
        console.log("[레벨 2] 요청");
        sendNextFrame(newLevel, null);
        onDeactivateScreensaver();
      }
    }
  };

  // 이미지 요청 보내는 함수
  function sendNextFrame(level: number, uuid: any) {
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    if (!isLocalServerConnected()) {
      return;
    }
    console.log(`이미지 요청 보내기 level: ${level} uuid: ${uuid}`);

    if (requestQueue.current.pending) {
      // 다음 요청으로 저장
      requestQueue.current.nextRequest = { level, uuid };
      return;
    }

    // 진행 중으로 표시
    requestQueue.current.pending = true;

    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      const tempCanvas = tempCanvasRef.current;
      if (tempCanvas) {
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.drawImage(video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
          lastProcessedFrameRef.current = tempCtx.getImageData(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
          const frameData = tempCanvas.toDataURL("image/jpeg", 0.6).split(",")[1];

          processingTimeoutRef.current = window.setTimeout(() => {
            console.warn("[WebSocket] 응답 타임아웃");
            requestQueue.current.pending = false;

            // 큐에 다음 항목이 있으면 처리
            if (requestQueue.current.nextRequest) {
              const { level, uuid } = requestQueue.current.nextRequest;
              requestQueue.current.nextRequest = null;
              sendNextFrame(level, uuid);
            }
          }, 5000);

          sendToLocalServer({ image: frameData, level: level, uuid: uuid });
        }
      }
    }
  }

  // 초기 설정 함수
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

  // 정리 함수
  const cleanup = () => {
    // 애니메이션 프레임 중지
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    // 미디어 스트림 중지
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    // 모든 타임아웃 및 인터벌 정리
    if (connectionCheckIntervalRef.current) {
      window.clearInterval(connectionCheckIntervalRef.current);
      connectionCheckIntervalRef.current = null;
    }
    if (processingTimeoutRef.current) {
      window.clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    // 웹소켓 연결 해제
    disconnectLocalServer();

    // 상태 재설정
    isInitializedRef.current = false;
    prevBoundingBoxRef.current = null;
    lastProcessedFrameRef.current = null;
  };

  // 초기 useEffect
  useEffect(() => {
    const runInitAndLoad = async () => {
      try {
        await init(); // 먼저 웹캠 시작
        await initLocalServerWebSocket(); // 웹소켓 연결이 되면 시작

        // 최신 WASM 경로로 수정
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
          numFaces: 10,
        });

        setFaceLandmarker(landmarker);
        console.log("[MediaPipe] Face landmarker loaded successfully");
      } catch (err) {
        console.error("[MediaPipe] Setup error:", err);
        setError("MediaPipe 설정 오류: " + (err as Error).message);
      }
    };

    runInitAndLoad();
    return cleanup;
  }, []);

  // 웹캠 인식 시작
  useEffect(() => {
    const detectLoop = async () => {
      try {
        if (!faceLandmarker || !videoRef.current || !overlayCanvasRef.current) {
          requestRef.current = requestAnimationFrame(detectLoop);
          return;
        }

        // 미디어파이프 인식 결과
        const results = faceLandmarker.detectForVideo(videoRef.current, performance.now());

        let currentBox: BoundingBox | null = null;
        let isFront = false;
        let iouText = "";
        let isEdgeText = "";
        let isTooCloseToEdge = false;

        const currentLevel = faceLevelRef.current.level;
        const currentCut = currentLevel === 2 ? SMALL_FACE_CUT : LARGE_FACE_CUT;
        let nextFaceLevel = faceLevel;

        // 인식된 얼굴이 있다면
        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          let largestFaceIndex = 0;
          let largestFaceArea = 0;

          for (let i = 0; i < results.faceLandmarks.length; i++) {
            const landmarks = results.faceLandmarks[i];
            let minX = 1,
              minY = 1,
              maxX = 0,
              maxY = 0;

            for (const point of landmarks) {
              minX = Math.min(minX, point.x);
              minY = Math.min(minY, point.y);
              maxX = Math.max(maxX, point.x);
              maxY = Math.max(maxY, point.y);
            }

            const width = (maxX - minX) * VIDEO_WIDTH;
            const height = (maxY - minY) * VIDEO_HEIGHT;
            const area = width * height;

            if (area > largestFaceArea) {
              largestFaceArea = area;
              largestFaceIndex = i;
            }
          }

          // 랜드마크에서 바운딩 박스 계산
          const landmarks = results.faceLandmarks[largestFaceIndex];
          // 얼굴 경계를 찾아 바운딩 박스 생성
          let minX = 1,
            minY = 1,
            maxX = 0,
            maxY = 0;
          for (const point of landmarks) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
          }

          // 바운딩 박스를 픽셀 좌표로 변환
          const box: BoundingBox = {
            originX: minX * VIDEO_WIDTH,
            originY: minY * VIDEO_HEIGHT,
            width: (maxX - minX) * VIDEO_WIDTH,
            height: (maxY - minY) * VIDEO_HEIGHT,
            angle: 0,
          };

          currentBox = box;
          isFront = isFacingFront(results.faceLandmarks);
          isTooCloseToEdge = isFaceTooCloseToEdge(box);

          if (currentBox) {
            const area = currentBox.width * currentBox.height;
            const prevBox = prevBoundingBoxRef.current;
            let iou = 0;

            // IOU 계산
            if (prevBox) {
              iou = calculateIOU(currentBox, prevBox);
              iouText = `IOU: ${iou.toFixed(2)}`;
            }

            // 레벨 2가 되기 위한 조건: 충분한 크기 AND 정면 바라보기 AND 화면 가장자리에 너무 가깝지 않음 AND 큰 IOU
            if (
              area >= currentCut &&
              ((isFront && iou > IOU_CUT && !isTooCloseToEdge) || faceLevelRef.current.level == 2)
            ) {
              nextFaceLevel = { level: 2, cut: SMALL_FACE_CUT };
            } else {
              nextFaceLevel = { level: 1, cut: LARGE_FACE_CUT };
            }

            prevBoundingBoxRef.current = currentBox;
            isEdgeText = isTooCloseToEdge ? "가장자리: O" : "가장자리: X";
          }
        } else {
          nextFaceLevel = { level: 0, cut: LARGE_FACE_CUT };
          prevBoundingBoxRef.current = null;
        }

        if (nextFaceLevel.level !== faceLevelRef.current.level) {
          handleFaceLevelChange(nextFaceLevel.level);
          // 2레벨에서 벗어나면 화면 닫기
          if (faceLevelRef.current.level == 2) {
            onActivateScreensaver();
          }
          updateFaceLevel(nextFaceLevel);
        }

        // 캔버스에 그리기
        const ctx = overlayCanvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

          // 배경 비디오 프레임 그리기
          if (videoRef.current) {
            ctx.drawImage(videoRef.current, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
          }

          // 가장자리 영역 표시 (시각적 피드백을 위해)
          ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            EDGE_MARGIN,
            EDGE_MARGIN,
            VIDEO_WIDTH - EDGE_MARGIN * 2,
            VIDEO_HEIGHT - EDGE_MARGIN * 2
          );

          // 얼굴 박스 및 정보 그리기
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
            ctx.fillRect(originX, originY - 100, 160, 100);
            ctx.fillStyle = "#000000";
            ctx.font = "14px Arial";

            // 정면 여부 표시
            const facingText = isFront ? "정면: O" : "정면: X";
            ctx.fillText(facingText, originX + 5, originY - 70);

            // 가장자리 여부 표시
            ctx.fillText(isEdgeText, originX + 5, originY - 50);

            if (iouText) {
              ctx.fillText(iouText, originX + 5, originY - 30);
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
  }, [faceLandmarker]);

  // 얼굴 레벨에 따른 기능
  useEffect(() => {
    // 웹소켓 메시지 핸들러
    async function handleFaceRecognition(result: any) {
      // 현재 레벨이 0이고 응답이 도착한 경우, 마지막 레벨 0 시간 기록
      if (faceLevelRef.current.level === 0 && lastLevelZeroTimeRef.current === null) {
        lastLevelZeroTimeRef.current = Date.now();
        console.log("[WebSocket] Recording level 0 transition time");
      }
      // 레벨이 0이 아닌 경우, 마지막 레벨 0 시간 초기화
      else if (faceLevelRef.current.level !== 0) {
        lastLevelZeroTimeRef.current = null;
      }

      // 레벨 0 이후에 도착한 모든 응답 무시 (레벨이 1 또는 2로 변경될 때까지)
      if (lastLevelZeroTimeRef.current !== null) {
        console.log("[WebSocket] Ignoring stale response after level 0 transition");
        requestQueue.current.pending = false;
        return;
      }

      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      console.log("[WebSocket] 응답 수신:", result);

      requestQueue.current.pending = false;

      const isNew = result?.is_new;
      const detected = result?.result?.[0];
      const memberId = detected?.identity;

      console.log(`기존: ${currentMemberId} 응답: ${memberId}`);

      if (!memberId) {
        // 인식 결과 없음 → 무조건 null 처리
        setCurrentMemberId("");
      }
      // 새로운 아이디라면
      else if (isNew) {
        try {
          // 신규 등록하기
          const newMember = await createAndGetMember({
            member_id: memberId,
            age: 0,
            image_path: `${import.meta.env.VITE_LOCAL_SERVER_URL}/vision/get-faces?user_id=${memberId}`,
          });
          setCurrentMemberId(newMember.member_id);
        } catch (err) {
          console.error("[WebSocket] 멤버 업데이트 실패:", err);
        }
      }

      // 새로운 아이디가 아닌데 현재 멤버 아이디와 다를 때
      else if (memberId !== currentMemberId) {
        try {
          // 인식된 멤버가 있을때 가져오기만 함
          setCurrentMemberId(memberId);
        } catch (err) {
          console.error("[WebSocket] 멤버 업데이트 실패:", err);
        }
      }

      // 큐에 다음 항목이 있으면 처리
      if (requestQueue.current.nextRequest) {
        const { level, uuid } = requestQueue.current.nextRequest;
        requestQueue.current.nextRequest = null;
        sendNextFrame(level, uuid);
      } else if (faceLevelRef.current.level === 1) {
        // 레벨이 1인 경우에만 자동으로 계속
        setTimeout(() => {
          if (faceLevelRef.current.level === 1) {
            sendNextFrame(1, null);
          }
        }, 100);
      }
    }

    onLocalServerMessage(handleFaceRecognition);

    return () => {
      offLocalServerMessage(handleFaceRecognition);
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

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
