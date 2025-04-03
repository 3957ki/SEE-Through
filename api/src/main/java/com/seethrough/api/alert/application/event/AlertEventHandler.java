package com.seethrough.api.alert.application.event;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.seethrough.api.alert.application.service.AlertService;
import com.seethrough.api.alert.domain.event.CreateAlertByIngredientEvent;
import com.seethrough.api.alert.domain.event.CreateAlertByMemberEvent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AlertEventHandler {

	private final AlertService alertService;

	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handleAlert(CreateAlertByIngredientEvent event) {
		log.info("[AlertEventHandler] 식재료 입고 시, 경고 생성 이벤트 발행");

		alertService.createAlertByIngredient(event.getIngredients());
	}

	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handleAlert(CreateAlertByMemberEvent event) {
		log.info("[AlertEventHandler] 구성원 수정 시, 경고 생성 이벤트 발행");

		alertService.createAlertByMember(event.getMemberId());
	}
}
