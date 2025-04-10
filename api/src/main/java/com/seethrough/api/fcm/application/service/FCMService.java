package com.seethrough.api.fcm.application.service;

import com.google.firebase.messaging.*;
import com.seethrough.api.fcm.domain.FCMToken;
import com.seethrough.api.fcm.domain.FCMTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FCMService {

    private final FCMTokenRepository fcmTokenRepository;

    public String saveFCMToken(String token){
        try{
            if(!fcmTokenRepository.existsById(token)){
                FCMToken fcmToken = FCMToken.builder()
                        .fcmToken(token)
                        .build();
                fcmTokenRepository.save(fcmToken);
                return "토큰이 저장되었습니다.";
            }else
                return "이미 해당 토큰이 존재합니다.";
        } catch (Exception e){
            System.out.println(e.getMessage());
            return "토큰 저장에 실패했습니다.";
        }
    }

    public List<FCMToken> getFCMTokenList(){
        try{
            return fcmTokenRepository.findAll();
        } catch (Exception e){
            return null;
        }
    }

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

    public String sendNotification(String title, String body){
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            List<FCMToken> tokens = fcmTokenRepository.findAll();
            List<String> tokenList = tokens.stream()
                    .map(FCMToken::getFcmToken)
                    .collect(Collectors.toList());

            if (tokenList.isEmpty()) return "푸시 알림 전송 실패: 토큰이 없습니다.";

            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(tokenList)
                    .setNotification(notification)
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            return "푸시 알림 전송 성공: " + response.getSuccessCount() + "명에게 전송됨.";
        } catch (Exception e) {
            e.printStackTrace();
            return "푸시 알림 전송 실패: " + e.getMessage();
        }

    }

    public String sendOutMonitorNotification(String userName, String ingredientName){
        String title = "See-Through 출고 알림";
        String body = userName + "님이 " + ingredientName + "를 출고하였습니다.";
        return sendNotification(title, body);
    }

    public String sendRecommendCommentNotification(String userName, String comment){
        String title = "See-Through 추천 코멘트";
        String body = comment;
        return sendNotification(title, body);
    }

}
