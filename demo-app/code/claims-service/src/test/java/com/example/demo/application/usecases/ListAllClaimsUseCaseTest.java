package com.example.demo.application.usecases;

import com.example.demo.domain.claim.ClaimRepository;
import com.example.demo.domain.claim.ClaimStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;

@ExtendWith(MockitoExtension.class)
@DisplayName("UT-ADM-01 ListAllClaimsUseCase filter routing")
class ListAllClaimsUseCaseTest {

    private static final UUID USER_ID = UUID.randomUUID();

    @Mock private ClaimRepository claimRepository;
    @InjectMocks private ListAllClaimsUseCase useCase;

    @Test
    void noFilterReadsEveryClaim() {
        useCase.execute(ListAllClaimsQuery.all());

        verify(claimRepository).findAll();
        verifyNoMoreInteractions(claimRepository);
    }

    @Test
    void statusFilterReadsByStatus() {
        useCase.execute(ListAllClaimsQuery.byStatus(ClaimStatus.SUBMITTED));

        verify(claimRepository).findAllByStatus(ClaimStatus.SUBMITTED);
        verifyNoMoreInteractions(claimRepository);
    }

    @Test
    void userFilterReadsByUser() {
        useCase.execute(ListAllClaimsQuery.byUserId(USER_ID));

        verify(claimRepository).findByUserId(USER_ID);
        verifyNoMoreInteractions(claimRepository);
    }

    @Test
    void bothFiltersReadByStatusAndUser() {
        useCase.execute(ListAllClaimsQuery.byStatusAndUserId(ClaimStatus.APPROVED, USER_ID));

        verify(claimRepository).findAllByStatusAndUserId(ClaimStatus.APPROVED, USER_ID);
        verifyNoMoreInteractions(claimRepository);
    }
}
