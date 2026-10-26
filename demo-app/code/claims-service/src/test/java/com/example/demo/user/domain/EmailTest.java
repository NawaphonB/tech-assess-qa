package com.example.demo.user.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("UT-SIGN-01 Email value object")
class EmailTest {

    @ParameterizedTest(name = "accepts {0}")
    @ValueSource(strings = {"a@b.co", "jane.doe+claims@example.com"})
    void acceptsWellFormedAddresses(String address) {
        assertThat(Email.of(address).value()).isEqualTo(address);
    }

    @ParameterizedTest(name = "rejects \"{0}\"")
    @ValueSource(strings = {"a@b", "jane.doe", "jane@", " "})
    void rejectsMalformedAddresses(String address) {
        assertThatThrownBy(() -> Email.of(address)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsNull() {
        assertThatThrownBy(() -> Email.of(null)).isInstanceOf(NullPointerException.class);
    }
}
