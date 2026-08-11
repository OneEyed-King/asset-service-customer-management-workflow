package com.vc.roservicemanager;

import com.vc.roservicemanager.auth.config.JwtProperties;
import com.vc.roservicemanager.platformadmin.config.PlatformAdminProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableConfigurationProperties({JwtProperties.class, PlatformAdminProperties.class})
public class RoservicemanagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(RoservicemanagerApplication.class, args);
	}

}
