package edu.ut.hrm.tests;

public final class HrmAssertions {
    private HrmAssertions() {
    }

    public static void assertEquals(double expected, double actual, double epsilon, String message) {
        if (Math.abs(expected - actual) > epsilon) {
            throw new AssertionError(message + " | expected=" + expected + ", actual=" + actual);
        }
    }

    public static void assertTrue(boolean condition, String message) {
        if (!condition) {
            throw new AssertionError(message);
        }
    }

    public static <T extends Throwable> void assertThrows(Class<T> expectedType, Runnable action, String message) {
        try {
            action.run();
        } catch (Throwable ex) {
            if (expectedType.isInstance(ex)) {
                return;
            }
            throw new AssertionError(
                    message + " | expected exception=" + expectedType.getSimpleName()
                            + ", actual exception=" + ex.getClass().getSimpleName(),
                    ex
            );
        }
        throw new AssertionError(message + " | expected exception=" + expectedType.getSimpleName() + ", but nothing was thrown");
    }
}
