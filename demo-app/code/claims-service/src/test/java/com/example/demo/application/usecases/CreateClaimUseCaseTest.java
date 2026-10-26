package com.example.demo.application.usecases;

import com.example.demo.application.exceptions.UserNotFoundException;
import com.example.demo.domain.claim.Claim;
import com.example.demo.domain.claim.ClaimRepository;
import com.example.demo.domain.claim.events.ClaimSubmitted;
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

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static com.example.demo.support.ClaimTestData.VALID_AMOUNT;
import static com.example.demo.support.ClaimTestData.VALID_DESCRIPTION;
import static com.example.demo.support.ClaimTestData.VALID_LOCATION;
import static com.example.demo.support.UserTestData.aClaimant;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UT-SUB-05 CreateClaimUseCase")
class CreateClaimUseCaseTest {

    private static final UUID CLAIMANT_ID = UUID.randomUUID();
    private static final String CDC_FLAG = "cdcEnabled";

    @Mock private ClaimRepository claimRepository;
    @Mock private UserRepository userRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    private CreateClaimUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new CreateClaimUseCase(claimRepository, userRepository, new SimpleMeterRegistry(), eventPublisher);
    }

    @Test
    void unknownUserCannotSubmitAClaim() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> useCase.execute(validCommand())).isInstanceOf(UserNotFoundException.class);
        verify(claimRepository, never()).save(any());
    }

    @Test
    void publishesClaimSubmittedWhenCdcIsOff() {
        givenKnownClaimantAndSavingWorks();
        ReflectionTestUtils.setField(useCase, CDC_FLAG, false);

        Claim saved = useCase.execute(validCommand());

        assertThat(saved.getUserId()).isEqualTo(CLAIMANT_ID);
        verify(eventPublisher).publishEvent(isA(ClaimSubmitted.class));
    }

    @Test
    void leavesPublishingToDebeziumWhenCdcIsOn() {
        givenKnownClaimantAndSavingWorks();
        ReflectionTestUtils.setField(useCase, CDC_FLAG, true);

        useCase.execute(validCommand());

        verify(eventPublisher, never()).publishEvent(any(Object.class));
    }

    private void givenKnownClaimantAndSavingWorks() {
        when(userRepository.findById(UserId.of(CLAIMANT_ID))).thenReturn(Optional.of(aClaimant(CLAIMANT_ID)));
        when(claimRepository.save(any(Claim.class))).thenAnswer(call -> call.getArgument(0));
    }

    private static CreateClaimCommand validCommand() {
        return new CreateClaimCommand(CLAIMANT_ID, LocalDate.now().minusDays(1), VALID_LOCATION, VALID_DESCRIPTION, VALID_AMOUNT);
    }
}
