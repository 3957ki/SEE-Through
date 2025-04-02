// import { speakWithOpenAI } from "@/lib/textToSpeech";

// const voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];

// function TTSVoiceTester() {
//   const sampleText = "안녕하세요. 다양한 목소리를 테스트해보세요!";

//   const handleVoiceTest = (voice: string) => {
//     speakWithOpenAI(sampleText, voice);
//   };

//   return (
//     <div className="p-4">
//       <h2 className="text-lg font-semibold mb-2">🎤 TTS 목소리 테스트</h2>
//       <div className="flex flex-wrap gap-2">
//         {voices.map((voice) => (
//           <button
//             key={voice}
//             onClick={() => handleVoiceTest(voice)}
//             className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//           >
//             {voice}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default TTSVoiceTester;
