package com.seethrough.api.fcm.application.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class FCMService {
    public String sendNotification(String token, String title, String body) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message message = Message.builder()
                    .setToken(token) // FCM 토큰 지정
                    .setNotification(notification)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            return "푸시 알림 전송 성공: " + response;
        } catch (Exception e) {
            e.printStackTrace();
            return "푸시 알림 전송 실패: " + e.getMessage();
        }
    }
}
