package com.example.demo.support;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.InvocationInterceptor;
import org.junit.jupiter.api.extension.ReflectiveInvocationContext;
import org.opentest4j.TestAbortedException;

import java.lang.reflect.Method;

/** Turns the outcome of a {@link KnownDefect} test into "still reproduces" or "looks fixed". */
public class KnownDefectExtension implements InvocationInterceptor {

    @Override
    public void interceptTestMethod(Invocation<Void> invocation,
                                    ReflectiveInvocationContext<Method> invocationContext,
                                    ExtensionContext extensionContext) throws Throwable {
        String defectId = extensionContext.getRequiredTestMethod().getAnnotation(KnownDefect.class).value();
        try {
            invocation.proceed();
        } catch (AssertionError stillBroken) {
            throw new TestAbortedException("Known defect " + defectId + " still reproduces: " + stillBroken.getMessage());
        }
        throw new AssertionError("Known defect " + defectId
                + " no longer reproduces. Remove @KnownDefect and keep this test as a regression check.");
    }
}
