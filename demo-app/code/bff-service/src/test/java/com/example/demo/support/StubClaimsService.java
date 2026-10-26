package com.example.demo.support;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.Executors;

/**
 * In-process stand-in for the claims service. {@code GET /api/claims} answers with one
 * claim whose description is the bearer token the request arrived with, so a test can
 * see exactly which caller's token the BFF forwarded.
 */
public final class StubClaimsService implements AutoCloseable {

    private static final String BEARER = "Bearer ";
    private static final int WORKER_THREADS = 8;

    private final HttpServer server;

    private StubClaimsService(HttpServer server) {
        this.server = server;
    }

    public static StubClaimsService start() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/api/claims", StubClaimsService::echoBearerTokenAsClaim);
        server.setExecutor(Executors.newFixedThreadPool(WORKER_THREADS));
        server.start();
        return new StubClaimsService(server);
    }

    public String baseUrl() {
        return "http://localhost:" + server.getAddress().getPort();
    }

    private static void echoBearerTokenAsClaim(HttpExchange exchange) throws IOException {
        String authorization = exchange.getRequestHeaders().getFirst("Authorization");
        String token = authorization == null ? "" : authorization.substring(BEARER.length());
        String body = """
                [{"claimId":"%s","incidentDate":"2026-10-25","description":"%s",
                  "claimAmount":100.0,"status":"SUBMITTED","createdAt":"2026-10-25T10:00:00Z"}]
                """.formatted(UUID.randomUUID(), token);
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(200, bytes.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(bytes);
        }
    }

    @Override
    public void close() {
        server.stop(0);
    }
}
