package com.uems.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${SPRING_DATASOURCE_URL:${DATABASE_URL:}}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:${spring.datasource.username:}}")
    private String username;

    @Value("${SPRING_DATASOURCE_PASSWORD:${spring.datasource.password:}}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        String url = databaseUrl;
        if (url != null && !url.isEmpty()) {
            url = url.trim();
            if (url.startsWith("postgres://")) {
                url = "jdbc:postgresql://" + url.substring("postgres://".length());
            } else if (url.startsWith("postgresql://")) {
                url = "jdbc:postgresql://" + url.substring("postgresql://".length());
            }
        }
        
        return DataSourceBuilder.create()
                .driverClassName(driverClassName)
                .url(url)
                .username(username)
                .password(password)
                .build();
    }
}
