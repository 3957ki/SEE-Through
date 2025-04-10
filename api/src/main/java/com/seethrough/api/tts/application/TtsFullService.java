package com.seethrough.api.tts.application;

import org.springframework.stereotype.Service;

import com.seethrough.api.tts.domain.dto.TtsRequest;
import com.seethrough.api.tts.infrastructure.TtsExternalClient;

@Service
public class TtsFullService {

    private final TtsExternalClient client;

    public TtsFullService(TtsExternalClient client) {
        this.client = client;
    }

    public byte[] generateSpeechAudio(TtsRequest request) throws InterruptedException {
        String speakUrl = client.requestSpeakUrl(request);
        String audioUrl = client.pollAudioDownloadUrl(speakUrl);
        return client.downloadAudioFile(audioUrl);
    }
}
