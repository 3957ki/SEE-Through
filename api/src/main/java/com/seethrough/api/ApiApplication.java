package com.seethrough.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@SpringBootApplication
@ComponentScan(
	basePackages = "com.seethrough.api",
	excludeFilters = {
		@ComponentScan.Filter(
			type = FilterType.REGEX,
			pattern = "com\\.seethrough\\.api\\.fcm\\..*"
		),
		@ComponentScan.Filter(
			type = FilterType.REGEX,
			pattern = "com\\.seethrough\\.api\\.ingredient\\..*"
		)
	}
)
public class ApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiApplication.class, args);
	}

}
