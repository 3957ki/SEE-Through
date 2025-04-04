import { APIServerFetcher } from "@/lib/fetchers";

export async function speakWithTTS(text: string, actorId: string): Promise<void> {
  try {
    const response = await APIServerFetcher.post("/tts/full", {
      text,
      actor_id: actorId,
    });

    const blob = new Blob([response.data], { type: "audio/mpeg" });
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (error) {
    console.error("TTS 호출 실패:", error);
  }
}
