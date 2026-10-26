package com.example.demo.support;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.extension.ExtendWith;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a test that asserts the correct behaviour for a defect that is still open.
 * While the defect reproduces, the test is reported as aborted with the defect id;
 * once it stops reproducing, the test fails so the marker is removed and the test
 * stays as a regression check. See {@link KnownDefectExtension}.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Tag("known-defect")
@ExtendWith(KnownDefectExtension.class)
public @interface KnownDefect {

    /** Defect id from the defect register, for example {@code "B1"}. */
    String value();
}
