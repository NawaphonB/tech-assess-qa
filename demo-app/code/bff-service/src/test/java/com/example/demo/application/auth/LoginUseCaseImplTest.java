package com.example.demo.application.auth;

import com.example.demo.application.auth.ClaimsServicePort.UserRecord;
import com.example.demo.application.auth.KeycloakTokenPort.TokenResponse;
import com.example.demo.support.JwtTestTokens;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("LoginUseCaseImpl")
class LoginUseCaseImplTest {

    private static final UUID USER_ID = UUID.randomUUID();
    private static final String EMAIL = "jane@demo.com";
    private static final String NAME = "Jane Doe";
    private static final String PASSWORD = "Secret123";

    @Mock private KeycloakTokenPort keycloakTokenPort;
    @Mock private ClaimsServicePort claimsServicePort;

    private LoginUseCase loginUseCase;

    @BeforeEach
    void setUp() {
        loginUseCase = new LoginUseCaseImpl(keycloakTokenPort, claimsServicePort, new ObjectMapper());
    }

    @Nested
    @DisplayName("UT-AUTH-01 role taken from the token when a profile is created")
    class RoleMapping {

        @Test
        void adminRealmRoleBecomesAdmin() {
            assertThat(roleProvisionedFor(List.of("admin"))).isEqualTo("ADMIN");
        }

        @Test
        void claimantRealmRoleBecomesClaimant() {
            assertThat(roleProvisionedFor(List.of("claimant"))).isEqualTo("CLAIMANT");
        }

        @Test
        void tokenWithoutRolesDefaultsToClaimant() {
            assertThat(roleProvisionedFor(null)).isEqualTo("CLAIMANT");
        }

        private String roleProvisionedFor(List<String> realmRoles) {
            givenKeycloakIssues(realmRoles);
            when(claimsServicePort.getUser(USER_ID)).thenThrow(new IllegalStateException("not found"));
            when(claimsServicePort.createUser(eq(USER_ID), anyString(), anyString(), anyString()))
                    .thenAnswer(call -> new UserRecord(USER_ID, EMAIL, NAME, call.getArgument(3), OffsetDateTime.now()));

            return loginUseCase.login(new LoginCommand(EMAIL, PASSWORD)).role();
        }
    }

    @Nested
    @DisplayName("UT-AUTH-02 profile provisioning")
    class Provisioning {

        @Test
        void existingProfileIsReturnedWithoutCreatingAnother() {
            givenKeycloakIssues(List.of("claimant"));
            when(claimsServicePort.getUser(USER_ID)).thenReturn(new UserRecord(USER_ID, EMAIL, NAME, "CLAIMANT", OffsetDateTime.now()));

            LoginResult result = loginUseCase.login(new LoginCommand(EMAIL, PASSWORD));

            assertThat(result.userId()).isEqualTo(USER_ID);
            verify(claimsServicePort, never()).createUser(any(), any(), any(), any());
        }

        @Test
        void missingProfileIsCreatedFromTheTokenDetails() {
            givenKeycloakIssues(List.of("claimant"));
            when(claimsServicePort.getUser(USER_ID)).thenThrow(new IllegalStateException("not found"));
            when(claimsServicePort.createUser(USER_ID, EMAIL, NAME, "CLAIMANT"))
                    .thenReturn(new UserRecord(USER_ID, EMAIL, NAME, "CLAIMANT", OffsetDateTime.now()));

            LoginResult result = loginUseCase.login(new LoginCommand(EMAIL, PASSWORD));

            assertThat(result.email()).isEqualTo(EMAIL);
            verify(claimsServicePort).createUser(USER_ID, EMAIL, NAME, "CLAIMANT");
        }
    }

    private void givenKeycloakIssues(List<String> realmRoles) {
        String accessToken = JwtTestTokens.accessToken(USER_ID.toString(), EMAIL, NAME, realmRoles);
        when(keycloakTokenPort.getTokens(EMAIL, PASSWORD)).thenReturn(new TokenResponse(accessToken, "refresh-token", 300, 1800));
    }
}
