package com.seethrough.api.alert.domain;

import java.util.List;

public interface AlertRepository {

	void saveAllWithoutDuplicates(List<Alert> alerts);
}
