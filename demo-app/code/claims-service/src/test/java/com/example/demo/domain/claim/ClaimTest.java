package com.example.demo.domain.claim;

import com.example.demo.domain.claim.events.ClaimStatusChanged;
import com.example.demo.domain.claim.events.ClaimSubmitted;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.time.LocalDate;

import static com.example.demo.support.ClaimTestData.aClaim;
import static com.example.demo.support.ClaimTestData.textOfLength;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Claim (domain aggregate)")
class ClaimTest {

    private static final int MIN_DESCRIPTION = 10;
    private static final int MAX_DESCRIPTION = 1000;
    private static final int MIN_LOCATION = 5;
    private static final int MAX_LOCATION = 200;

    @Nested
    @DisplayName("UT-SUB-01 a valid new claim")
    class ValidClaim {

        @Test
        void startsAsSubmittedWithTrimmedTextAndOneSubmittedEvent() {
            Claim claim = aClaim()
                    .withLocation("  12 Orchard Road  ")
                    .withDescription("  Burst pipe in the kitchen  ")
                    .build();

            assertThat(claim.getStatus()).isEqualTo(ClaimStatus.SUBMITTED);
            assertThat(claim.getIncidentLocation()).isEqualTo("12 Orchard Road");
            assertThat(claim.getDescription()).isEqualTo("Burst pipe in the kitchen");
            assertThat(claim.getDomainEvents())
                    .singleElement()
                    .isInstanceOf(ClaimSubmitted.class);
        }
    }

    @Nested
    @DisplayName("UT-SUB-02 incident date")
    class IncidentDate {

        @Test
        void acceptsToday() {
            Claim claim = aClaim().withIncidentDate(LocalDate.now()).build();

            assertThat(claim.getIncidentDate()).isEqualTo(LocalDate.now());
        }

        @Test
        void rejectsTomorrow() {
            assertThatThrownBy(() -> aClaim().withIncidentDate(LocalDate.now().plusDays(1)).build())
                    .isInstanceOf(InvalidClaimException.class)
                    .hasMessageContaining("future");
        }
    }

    @Nested
    @DisplayName("UT-SUB-03 claim amount boundaries")
    class Amount {

        @ParameterizedTest(name = "accepts {0}")
        @ValueSource(strings = {"0.01", "1000000"})
        void acceptsAmountsInsideTheRange(String amount) {
            assertThat(aClaim().withAmount(amount).build().getClaimAmount()).isEqualByComparingTo(amount);
        }

        @ParameterizedTest(name = "rejects {0}")
        @ValueSource(strings = {"0", "-1", "1000000.01"})
        void rejectsAmountsOutsideTheRange(String amount) {
            assertThatThrownBy(() -> aClaim().withAmount(amount).build())
                    .isInstanceOf(InvalidClaimException.class);
        }
    }

    @Nested
    @DisplayName("UT-SUB-04 description and location lengths")
    class TextLengths {

        @ParameterizedTest(name = "description of {0} characters is accepted")
        @ValueSource(ints = {MIN_DESCRIPTION, MAX_DESCRIPTION})
        void acceptsDescriptionAtTheLimits(int length) {
            assertThat(aClaim().withDescription(textOfLength(length)).build().getDescription()).hasSize(length);
        }

        @ParameterizedTest(name = "description of {0} characters is rejected")
        @ValueSource(ints = {MIN_DESCRIPTION - 1, MAX_DESCRIPTION + 1})
        void rejectsDescriptionOutsideTheLimits(int length) {
            assertThatThrownBy(() -> aClaim().withDescription(textOfLength(length)).build())
                    .isInstanceOf(InvalidClaimException.class);
        }

        @Test
        void countsDescriptionLengthAfterTrimming() {
            String paddedTooShort = "   " + textOfLength(MIN_DESCRIPTION - 1) + "   ";

            assertThatThrownBy(() -> aClaim().withDescription(paddedTooShort).build())
                    .isInstanceOf(InvalidClaimException.class);
        }

        @ParameterizedTest(name = "location of {0} characters is accepted")
        @ValueSource(ints = {MIN_LOCATION, MAX_LOCATION})
        void acceptsLocationAtTheLimits(int length) {
            assertThat(aClaim().withLocation(textOfLength(length)).build().getIncidentLocation()).hasSize(length);
        }

        @ParameterizedTest(name = "location of {0} characters is rejected")
        @ValueSource(ints = {MIN_LOCATION - 1, MAX_LOCATION + 1})
        void rejectsLocationOutsideTheLimits(int length) {
            assertThatThrownBy(() -> aClaim().withLocation(textOfLength(length)).build())
                    .isInstanceOf(InvalidClaimException.class);
        }
    }

    @Nested
    @DisplayName("UT-STA-02 status change on the aggregate")
    class StatusChange {

        @Test
        void validChangeUpdatesStatusAndRecordsOldAndNewStatus() {
            Claim claim = aClaim().inStatus(ClaimStatus.SUBMITTED);

            claim.updateStatus(ClaimStatus.UNDER_REVIEW);

            assertThat(claim.getStatus()).isEqualTo(ClaimStatus.UNDER_REVIEW);
            assertThat(claim.getUpdatedAt()).isAfter(claim.getCreatedAt());
            assertThat(claim.getDomainEvents())
                    .singleElement()
                    .isInstanceOfSatisfying(ClaimStatusChanged.class, event -> {
                        assertThat(event.oldStatus()).isEqualTo(ClaimStatus.SUBMITTED);
                        assertThat(event.newStatus()).isEqualTo(ClaimStatus.UNDER_REVIEW);
                    });
        }

        @Test
        void invalidChangeThrowsAndKeepsTheStatus() {
            Claim claim = aClaim().inStatus(ClaimStatus.APPROVED);

            assertThatThrownBy(() -> claim.updateStatus(ClaimStatus.SUBMITTED))
                    .isInstanceOf(InvalidStatusTransitionException.class);
            assertThat(claim.getStatus()).isEqualTo(ClaimStatus.APPROVED);
            assertThat(claim.getDomainEvents()).isEmpty();
        }
    }
}
