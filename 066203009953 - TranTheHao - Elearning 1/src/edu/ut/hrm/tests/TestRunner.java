package edu.ut.hrm.tests;

public class TestRunner {
    public static void main(String[] args) {
        int passed = 0;
        int failed = 0;

        failed += runSuite("TienThuongTests", () -> new TienThuongTests().runAll());
        passed += (failed == 0) ? 1 : 0;

        int failedBeforeFactory = failed;
        failed += runSuite("NhanVienFactoryTests", () -> new NhanVienFactoryTests().runAll());
        passed += (failed == failedBeforeFactory) ? 1 : 0;

        System.out.println("Test suites passed: " + passed);
        System.out.println("Test failures: " + failed);
        if (failed > 0) {
            System.exit(1);
        }
    }

    private static int runSuite(String name, Runnable suite) {
        try {
            suite.run();
            System.out.println("[PASS] " + name);
            return 0;
        } catch (Throwable ex) {
            System.out.println("[FAIL] " + name + " -> " + ex.getMessage());
            return 1;
        }
    }
}
