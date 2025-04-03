import axios from "axios";

// 🔁 오디오가 준비될 때까지 반복해서 확인
async function waitForAudioBlob(speakUrl: string, retries = 5, delay = 1000): Promise<Blob> {
  for (let i = 0; i < retries; i++) {
    const response = await axios.get(speakUrl, {
      headers: {
        Authorization: import.meta.env.VITE_TYPECAST_API_KEY ?? "",
      },
      responseType: "blob",
    });

    const contentType = response.headers["content-type"];
    if (contentType?.includes("audio")) {
      console.log(`[🔊 오디오 준비 완료] 재시도 ${i + 1}회 만에 성공`);
      return response.data;
    }

    console.warn(`[⏳ 오디오 생성 대기 중] 재시도 ${i + 1} / ${retries}`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error("오디오 생성이 완료되지 않았습니다.");
}

export async function speakComment(comment: string) {
  const payload = {
    actor_id: "666a9871abcf27a5169850d0",
    text: comment,
    lang: "auto",
    tempo: 1,
    volume: 100,
    pitch: 0,
    xapi_hd: false,
    max_seconds: 60,
    model_version: "latest",
    xapi_audio_format: "mp3",
  };

  try {
    // Step 1: 음성 생성 요청
    const response = await axios.post("https://typecast.ai/api/speak", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: import.meta.env.VITE_TYPECAST_API_KEY ?? "",
      },
      responseType: "json",
    });

    const speakUrl = response.data.result?.speak_v2_url;
    if (!speakUrl) throw new Error("Typecast 응답에 speak_v2_url이 없습니다");
    console.log("[🔁 TTS speak_url 요청 URL]", speakUrl);

    // Step 2: 오디오 준비 완료까지 대기
    const audioBlob = await waitForAudioBlob(speakUrl);
    const audioUrl = URL.createObjectURL(audioBlob);
    console.log("[✅ TTS 최종 오디오 URL]", audioUrl);

    // Step 3: 재생
    const audio = new Audio(audioUrl);
    audio.volume = 1;
    audio.onloadedmetadata = () => console.log("[🎧 오디오 로드 완료]");
    audio.onplay = () => console.log("[▶️ 오디오 재생 시작]");
    audio.onended = () => console.log("[✅ 오디오 재생 종료]");
    audio.onerror = (e) => console.error("[❌ 오디오 재생 오류]", e);

    audio.play();
  } catch (error: any) {
    console.error("[❌ TTS 실패]", error.response?.data || error.message);
  }
}
