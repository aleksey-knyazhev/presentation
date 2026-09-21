package ru.presentation.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Разрешаем CORS для всех эндпоинтов, начинающихся с /api
                        .allowedOrigins("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173") // URL вашего React-приложения (CRA или Vite)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Разрешенные HTTP-методы
                        .allowedHeaders("*"); // Разрешаем любые заголовки (Content-Type и т.д.)
            }
        };
    }
}
