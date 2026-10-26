package com.example.demo.support;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;

/** Builds unsigned JWT strings shaped like Keycloak access tokens, for code that only decodes them. */
public final class JwtTestTokens {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Base64.Encoder BASE64_URL = Base64.getUrlEncoder().withoutPadding();

    private JwtTestTokens() {
    }

    public static String accessToken(String subject, String email, String name, List<String> realmRoles) {
        Map<String, Object> claims = realmRoles == null
                ? Map.of("sub", subject, "email", email, "name", name)
                : Map.of("sub", subject, "email", email, "name", name, "realm_access", Map.of("roles", realmRoles));
        return encode(Map.of("alg", "none", "typ", "JWT")) + "." + encode(claims) + ".signature";
    }

    private static String encode(Map<String, ?> json) {
        try {
            return BASE64_URL.encodeToString(JSON.writeValueAsString(json).getBytes(StandardCharsets.UTF_8));
        } catch (JsonProcessingException e) {
            throw new IllegalStateException(e);
        }
    }
}
