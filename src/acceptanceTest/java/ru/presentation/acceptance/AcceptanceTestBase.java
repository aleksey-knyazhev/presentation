package ru.presentation.acceptance;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse.BodyHandlers;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class AcceptanceTestBase {

    @Container
    private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @LocalServerPort
    private int port;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    @DynamicPropertySource
    static void registerDatasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @BeforeEach
    void cleanDatabase() {
        jdbcTemplate.execute("TRUNCATE TABLE presentation.slides, presentation.presentations, presentation.templates RESTART IDENTITY CASCADE");
    }

    protected <T> ApiResponse<T> get(String path, Class<T> responseType) throws IOException, InterruptedException {
        return send(HttpRequest.newBuilder(uri(path)).GET().build(), responseType);
    }

    protected <T> ApiResponse<T> post(String path, Object request, Class<T> responseType) throws IOException, InterruptedException {
        return send(jsonRequest(path).POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(request))).build(), responseType);
    }

    protected <T> ApiResponse<T> put(String path, Object request, Class<T> responseType) throws IOException, InterruptedException {
        return send(jsonRequest(path).PUT(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(request))).build(), responseType);
    }

    protected ApiResponse<Void> delete(String path) throws IOException, InterruptedException {
        return send(HttpRequest.newBuilder(uri(path)).DELETE().build(), Void.class);
    }

    private HttpRequest.Builder jsonRequest(String path) {
        return HttpRequest.newBuilder(uri(path))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json");
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }

    private <T> ApiResponse<T> send(HttpRequest request, Class<T> responseType) throws IOException, InterruptedException {
        java.net.http.HttpResponse<String> response = httpClient.send(request, BodyHandlers.ofString());
        if (responseType == Void.class || response.body() == null || response.body().isBlank()) {
            return new ApiResponse<>(response.statusCode(), null);
        }

        return new ApiResponse<>(response.statusCode(), objectMapper.readValue(response.body(), responseType));
    }

    protected record ApiResponse<T>(int statusCode, T body) {
    }
}
