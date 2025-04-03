package com.seethrough.api.fcm.presentation;

import com.seethrough.api.fcm.application.service.FCMService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/fcm")
public class FCMController {
    private final FCMService fcmService;

    public FCMController(FCMService fcmService) {
        this.fcmService = fcmService;
    }

    @PostMapping("/token")
    public ResponseEntity<String> saveFCMToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String response = fcmService.saveFCMToken(token);
        return ResponseEntity.ok().body(response);
    }
}
