package com.example.demo.support;

import com.example.demo.user.domain.Email;
import com.example.demo.user.domain.User;
import com.example.demo.user.domain.UserId;
import com.example.demo.user.domain.UserRole;

import java.time.Instant;
import java.util.UUID;

/** Ready-made users for use-case tests. */
public final class UserTestData {

    private UserTestData() {
    }

    public static User anAdmin(UUID id) {
        return user(id, "Admin User", "admin@demo.com", UserRole.ADMIN);
    }

    public static User aClaimant(UUID id) {
        return user(id, "Test Claimant", "claimant@demo.com", UserRole.CLAIMANT);
    }

    private static User user(UUID id, String name, String email, UserRole role) {
        return new User(UserId.of(id), name, Email.of(email), role, Instant.parse("2026-10-01T00:00:00Z"));
    }
}
