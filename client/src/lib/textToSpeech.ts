// lib/textToSpeech.ts
export async function speakWithOpenAI(message: string, voice: string = "nova") {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1", // 또는 tts-1-hd
        voice,
        input: message,
        response_format: "mp3",
      }),
    });

    if (!response.ok) throw new Error("TTS 요청 실패");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } catch (error) {
    console.error("OpenAI TTS 실패:", error);
  }
}
