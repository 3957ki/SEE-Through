package com.seethrough.api.alert.domain;

import java.util.List;

public interface AlertRepository {

	void saveAll(List<Alert> alerts);
}
