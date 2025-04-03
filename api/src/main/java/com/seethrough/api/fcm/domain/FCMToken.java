package com.seethrough.api.fcm.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "fcm_tokens")
@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class FCMToken {
    @Id
    @Column(name = "fcm_token", columnDefinition = "VARCHAR(255)", nullable = false)
    private String fcmToken;
}
