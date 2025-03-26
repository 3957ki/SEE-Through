package com.seethrough.api.alert.domain;

import java.util.List;
import java.util.Optional;

public interface AlertRepository {

	void saveAllWithoutDuplicates(List<Alert> alerts);

	Optional<Alert> findByAlertId(AlertId alertId);
}
