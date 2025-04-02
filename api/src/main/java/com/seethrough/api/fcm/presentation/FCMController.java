package com.seethrough.api.fcm.presentation;

import com.seethrough.api.fcm.application.service.FCMService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/fcm")
public class FCMController {
    private final FCMService fcmService;

    public FCMController(FCMService fcmService) {
        this.fcmService = fcmService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String title = request.get("title");
        String body = request.get("body");

        String response = fcmService.sendNotification(token, title, body);
        return ResponseEntity.ok(response);
    }
}
