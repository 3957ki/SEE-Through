import { APIServerFetcher } from "@/lib/fetchers";

export async function speakWithTTS(text: string, actorId: string): Promise<void> {
  console.log("[TTS 요청 시작]");
  console.log("▶ 텍스트:", text);
  console.log("▶ actorId:", actorId);

  try {
    const response = await APIServerFetcher.post(
      "/tts/full",
      {
        text,
        actor_id: actorId,
      },
      {
        responseType: "blob",
      }
    );

    console.log("[TTS 응답 수신 완료]");
    console.log("▶ 응답 Blob 타입:", response.data.type);

    const audioUrl = URL.createObjectURL(response.data);
    console.log("▶ 생성된 오디오 URL:", audioUrl);

    const audio = new Audio(audioUrl);
    await audio.play();
    console.log("[TTS 재생 시작]");
  } catch (error) {
    console.error("[TTS 호출 실패]", error);
  }
}
