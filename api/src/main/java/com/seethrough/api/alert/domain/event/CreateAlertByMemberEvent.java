package com.seethrough.api.alert.domain.event;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class CreateAlertByMemberEvent {
	private final UUID memberId;
}
