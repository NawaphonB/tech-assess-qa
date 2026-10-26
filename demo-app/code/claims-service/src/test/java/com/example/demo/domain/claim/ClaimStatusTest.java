package com.example.demo.domain.claim;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Stream;

import static com.example.demo.domain.claim.ClaimStatus.APPROVED;
import static com.example.demo.domain.claim.ClaimStatus.CLOSED;
import static com.example.demo.domain.claim.ClaimStatus.REJECTED;
import static com.example.demo.domain.claim.ClaimStatus.SUBMITTED;
import static com.example.demo.domain.claim.ClaimStatus.UNDER_REVIEW;
import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("UT-STA-01 ClaimStatus transition table")
class ClaimStatusTest {

    /**
     * The 7 transitions the product allows today. UNDER_REVIEW -> SUBMITTED is included
     * because the code allows it; whether it should is open product question B7.
     */
    private static final Set<String> ALLOWED = Set.of(
            pair(SUBMITTED, UNDER_REVIEW),
            pair(SUBMITTED, REJECTED),
            pair(UNDER_REVIEW, APPROVED),
            pair(UNDER_REVIEW, REJECTED),
            pair(UNDER_REVIEW, SUBMITTED),
            pair(APPROVED, CLOSED),
            pair(REJECTED, CLOSED));

    static Stream<Arguments> everyFromToPair() {
        return Arrays.stream(ClaimStatus.values())
                .flatMap(from -> Arrays.stream(ClaimStatus.values()).map(to -> Arguments.of(from, to)));
    }

    @ParameterizedTest(name = "{0} -> {1}")
    @MethodSource("everyFromToPair")
    void allowsExactlyTheDocumentedTransitions(ClaimStatus from, ClaimStatus to) {
        boolean expected = ALLOWED.contains(pair(from, to));

        assertThat(from.canTransitionTo(to)).isEqualTo(expected);
    }

    private static String pair(ClaimStatus from, ClaimStatus to) {
        return from + "->" + to;
    }
}
