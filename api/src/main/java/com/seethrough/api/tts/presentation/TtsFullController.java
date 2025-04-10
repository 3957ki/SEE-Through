package com.seethrough.api.tts.presentation;

import com.seethrough.api.tts.application.TtsFullService;
import com.seethrough.api.tts.domain.dto.TtsRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/tts")
public class TtsFullController {

    private final TtsFullService ttsFullService;

    public TtsFullController(TtsFullService ttsFullService) {
        this.ttsFullService = ttsFullService;
    }

    @PostMapping("/full")
    public ResponseEntity<byte[]> getAudio(@RequestBody TtsRequest request) {
        try {
            log.info("TTS 요청 시작: {}", request.getText());
            byte[] audioBytes = ttsFullService.generateSpeechAudio(request);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"speech.mp3\"")
                    .contentType(MediaType.valueOf("audio/mpeg"))
                    .body(audioBytes);

        } catch (Exception e) {
            log.error("TTS 처리 중 예외 발생", e);
            return ResponseEntity.internalServerError().body(null);
        }
    }
}
