import warningSound from "@/assets/warning_2.mp3";
export function speakWithWebSpeech(message: string, lang: string = "ko-KR") {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = lang;
  utterance.rate = 1.1; // 속도 약간 빠르게
  speechSynthesis.speak(utterance);
}

export async function speakWithOpenAIStreaming(
  message: string,
  type: "child" | "adult" = "adult",
  danger: boolean = false
) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const voice = getVoiceByType(type);
  const systemPrompt = getSystemPrompt(type);
  const startTime = Date.now();
  const seconds = (ms: number) => (ms / 1000).toFixed(2) + "s";

  console.log(`[TTS] 요청 시작: ${new Date().toISOString()}`);
  console.log(`[TTS] 입력 메시지: "${message}", voice: ${voice}, type: ${type}, danger: ${danger}`);

  try {
    const requestPayload = {
      model: "gpt-4o-audio-preview",
      modalities: ["text", "audio"],
      audio: { voice, format: "wav" },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
    };

    const fetchStart = Date.now();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const fetchEnd = Date.now();
    console.log(`[TTS] Fetch 완료 (소요 시간: ${seconds(fetchEnd - fetchStart)})`);

    const result = await response.json();
    const base64 = result.choices?.[0]?.message?.audio?.data;
    if (!base64) throw new Error("오디오 데이터가 없습니다.");

    const decodeStart = Date.now();
    const audioBlob = base64ToBlob(base64, "audio/wav");
    const decodeEnd = Date.now();
    console.log(`[TTS] Base64 → Blob 변환 완료 (소요 시간: ${seconds(decodeEnd - decodeStart)})`);

    const url = URL.createObjectURL(audioBlob);
    const ttsAudio = new Audio(url);

    ttsAudio.onplay = () => {
      const total = Date.now() - startTime;
      console.log(`[TTS] 오디오 재생 시작! 전체 소요 시간: ${seconds(total)}`);
    };

    if (danger) {
      console.log(`[TTS] danger=true → 경고음 먼저 재생`);
      const warningAudio = new Audio(warningSound);

      warningAudio.onended = () => {
        console.log("[TTS] 경고음 재생 완료 → TTS 재생 시작");
        ttsAudio.play();
      };

      warningAudio.play();
    } else {
      ttsAudio.play();
    }
  } catch (error) {
    console.error("OpenAI 스트리밍 TTS 실패:", error);
  }
}
function getSystemPrompt(type: "child" | "adult"): string {
  if (type === "child") {
    return "너는 어린이를 위한 AI야. 사용자가 한 문장을 **밝고 경쾌한 말투로 그대로 읽어 줘**. 내용은 절대 바꾸지 마. 톤만 명랑하게!";
  }
  return "You are a TTS system. Repeat the user's message exactly, without paraphrasing.";
}

function getVoiceByType(type: "child" | "adult"): string {
  return type === "child" ? "nova" : "nova";
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: mimeType });
}
