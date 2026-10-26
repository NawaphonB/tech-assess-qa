package com.example.demo.application.usecases;

import com.example.demo.domain.claim.Claim;
import com.example.demo.domain.claim.ClaimNotFoundException;
import com.example.demo.domain.claim.ClaimRepository;
import com.example.demo.domain.claim.ClaimStatus;
import com.example.demo.domain.claim.events.ClaimStatusChanged;
import com.example.demo.user.domain.UnauthorizedException;
import com.example.demo.user.domain.UserId;
import com.example.demo.user.domain.UserRepository;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;
import java.util.UUID;

import static com.example.demo.support.ClaimTestData.aClaim;
import static com.example.demo.support.UserTestData.aClaimant;
import static com.example.demo.support.UserTestData.anAdmin;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UT-STA-03 UpdateClaimStatusUseCase")
class UpdateClaimStatusUseCaseTest {

    private static final UUID ADMIN_ID = UUID.randomUUID();
    private static final UUID CLAIMANT_ID = UUID.randomUUID();

    @Mock private ClaimRepository claimRepository;
    @Mock private UserRepository userRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    private UpdateClaimStatusUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new UpdateClaimStatusUseCase(claimRepository, userRepository, new SimpleMeterRegistry(), eventPublisher);
        ReflectionTestUtils.setField(useCase, "cdcEnabled", false);
    }

    @Test
    void adminMovesAClaimToTheNextStatusAndPublishesTheChange() {
        Claim stored = aClaim().ownedBy(CLAIMANT_ID).inStatus(ClaimStatus.SUBMITTED);
        when(userRepository.findById(UserId.of(ADMIN_ID))).thenReturn(Optional.of(anAdmin(ADMIN_ID)));
        when(claimRepository.findById(stored.getClaimId())).thenReturn(Optional.of(stored));
        when(claimRepository.save(any(Claim.class))).thenAnswer(call -> call.getArgument(0));

        Claim result = useCase.execute(new UpdateClaimStatusCommand(stored.getClaimId(), ClaimStatus.UNDER_REVIEW, ADMIN_ID));

        assertThat(result.getStatus()).isEqualTo(ClaimStatus.UNDER_REVIEW);
        verify(eventPublisher).publishEvent(isA(ClaimStatusChanged.class));
    }

    @Test
    void claimantIsRefusedAndNothingIsSaved() {
        when(userRepository.findById(UserId.of(CLAIMANT_ID))).thenReturn(Optional.of(aClaimant(CLAIMANT_ID)));

        assertThatThrownBy(() -> useCase.execute(new UpdateClaimStatusCommand(UUID.randomUUID(), ClaimStatus.APPROVED, CLAIMANT_ID)))
                .isInstanceOf(UnauthorizedException.class);
        verify(claimRepository, never()).save(any());
    }

    @Test
    void unknownCallerIsRefused() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute(new UpdateClaimStatusCommand(UUID.randomUUID(), ClaimStatus.APPROVED, ADMIN_ID)))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void unknownClaimIsReportedAsNotFound() {
        when(userRepository.findById(UserId.of(ADMIN_ID))).thenReturn(Optional.of(anAdmin(ADMIN_ID)));
        when(claimRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute(new UpdateClaimStatusCommand(UUID.randomUUID(), ClaimStatus.APPROVED, ADMIN_ID)))
                .isInstanceOf(ClaimNotFoundException.class);
        verify(claimRepository, never()).save(any());
    }
}
