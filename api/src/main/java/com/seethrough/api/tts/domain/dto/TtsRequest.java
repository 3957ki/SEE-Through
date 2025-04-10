package com.seethrough.api.tts.domain.dto;

public class TtsRequest {
    private String text;
    private String actorId;

    public TtsRequest() {}

    public TtsRequest(String text, String actorId) {
        this.text = text;
        this.actorId = actorId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }
}
