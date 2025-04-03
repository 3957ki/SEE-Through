package com.seethrough.api.fcm.domain;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FCMTokenRepository extends JpaRepository<FCMToken, String> {
}
