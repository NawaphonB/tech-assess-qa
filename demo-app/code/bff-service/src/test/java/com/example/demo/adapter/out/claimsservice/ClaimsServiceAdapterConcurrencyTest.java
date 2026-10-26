package com.example.demo.adapter.out.claimsservice;

import com.example.bff.adapter.out.claims.ApiClient;
import com.example.demo.application.auth.ClaimsServicePort.ClaimSummaryRecord;
import com.example.demo.application.auth.ServiceAccountTokenProvider;
import com.example.demo.support.KnownDefect;
import com.example.demo.support.StubClaimsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

@DisplayName("TC-MY-03 BFF keeps each caller's token when users call at the same time")
class ClaimsServiceAdapterConcurrencyTest {

    private static final int ROUNDS = 500;
    private static final String TOKEN_A = "token-of-claimant-a";
    private static final String TOKEN_B = "token-of-claimant-b";

    private StubClaimsService claimsService;
    private ClaimsServiceAdapter adapter;
    private ExecutorService callers;

    @BeforeEach
    void setUp() throws Exception {
        claimsService = StubClaimsService.start();
        ApiClient apiClient = new ApiClient();
        apiClient.setBasePath(claimsService.baseUrl());
        adapter = new ClaimsServiceAdapter(apiClient, mock(ServiceAccountTokenProvider.class), new ObjectMapper());
        callers = Executors.newFixedThreadPool(2);
    }

    @AfterEach
    void tearDown() {
        callers.shutdownNow();
        claimsService.close();
    }

    @Test
    @KnownDefect("B1")
    void everyResponseBelongsToTheCallerWhoAskedForIt() throws Exception {
        int crossedResponses = 0;
        for (int round = 0; round < ROUNDS; round++) {
            CyclicBarrier start = new CyclicBarrier(2);
            Future<String> seenByA = callers.submit(listClaimsAs(TOKEN_A, start));
            Future<String> seenByB = callers.submit(listClaimsAs(TOKEN_B, start));
            if (!TOKEN_A.equals(seenByA.get())) {
                crossedResponses++;
            }
            if (!TOKEN_B.equals(seenByB.get())) {
                crossedResponses++;
            }
        }

        assertThat(crossedResponses)
                .as("responses sent with the other caller's token, out of %d", ROUNDS * 2)
                .isZero();
    }

    /** Lists claims as the given user and returns the token the claims service actually received. */
    private Callable<String> listClaimsAs(String token, CyclicBarrier start) {
        return () -> {
            start.await();
            List<ClaimSummaryRecord> claims = adapter.listClaims(token, UUID.randomUUID());
            return claims.getFirst().description();
        };
    }
}
