package com.example.demo.support;

import com.example.demo.domain.claim.Claim;
import com.example.demo.domain.claim.ClaimStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Builder for {@link Claim} test data. Defaults are valid, so each test overrides
 * only the field it is about and the rest of the claim stays out of the way.
 */
public final class ClaimTestData {

    public static final String VALID_LOCATION = "12 Orchard Road, Singapore";
    public static final String VALID_DESCRIPTION = "Burst pipe flooded the kitchen floor";
    public static final BigDecimal VALID_AMOUNT = new BigDecimal("1234.56");

    private UUID claimId = UUID.randomUUID();
    private UUID userId = UUID.randomUUID();
    private LocalDate incidentDate = LocalDate.now().minusDays(1);
    private String incidentLocation = VALID_LOCATION;
    private String description = VALID_DESCRIPTION;
    private BigDecimal claimAmount = VALID_AMOUNT;

    private ClaimTestData() {
    }

    public static ClaimTestData aClaim() {
        return new ClaimTestData();
    }

    public ClaimTestData ownedBy(UUID owner) {
        this.userId = owner;
        return this;
    }

    public ClaimTestData withIncidentDate(LocalDate date) {
        this.incidentDate = date;
        return this;
    }

    public ClaimTestData withLocation(String location) {
        this.incidentLocation = location;
        return this;
    }

    public ClaimTestData withDescription(String text) {
        this.description = text;
        return this;
    }

    public ClaimTestData withAmount(String amount) {
        this.claimAmount = new BigDecimal(amount);
        return this;
    }

    /** A new claim through the validating constructor, as a claimant would submit it. */
    public Claim build() {
        return new Claim(claimId, userId, incidentDate, incidentLocation, description, claimAmount);
    }

    /** A stored claim already in the given status, as the repository would return it. */
    public Claim inStatus(ClaimStatus status) {
        Instant created = Instant.parse("2026-10-01T00:00:00Z");
        return Claim.reconstitute(claimId, userId, incidentDate, incidentLocation,
                description, claimAmount, status, created, created);
    }

    /** A string of exactly {@code length} characters, for length-boundary tests. */
    public static String textOfLength(int length) {
        return "x".repeat(length);
    }
}
