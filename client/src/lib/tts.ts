// utils/tts.ts
import axios from "axios";

export async function speakComment(comment: string) {
  try {
    const response = await axios.post(
      "https://typecast.ai/api/speak",
      {
        actor_id: "666a9871abcf27a5169850d0", // 원하는 화자 ID
        text: comment,
        lang: "auto",
        tempo: 1,
        volume: 100,
        pitch: 0,
        xapi_hd: true,
        max_seconds: 60,
        model_version: "latest",
        xapi_audio_format: "wav",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_ACCESS_TOKEN", // 토큰으로 바꿔주세요
        },
        responseType: "blob", // 오디오 스트림을 받기 위해 설정
      }
    );

    // Blob을 오디오로 재생
    const audioBlob = new Blob([response.data], { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error("[❌ TTS 실패]", error);
  }
}
