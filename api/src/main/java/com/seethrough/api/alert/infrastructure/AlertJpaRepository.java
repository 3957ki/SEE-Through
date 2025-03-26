package com.seethrough.api.alert.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.seethrough.api.alert.domain.Alert;
import com.seethrough.api.alert.domain.AlertId;

public interface AlertJpaRepository extends JpaRepository<Alert, AlertId> {
}
