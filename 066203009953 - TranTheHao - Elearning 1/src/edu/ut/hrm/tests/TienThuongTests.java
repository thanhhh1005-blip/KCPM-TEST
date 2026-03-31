package edu.ut.hrm.tests;

import edu.ut.hrm.models.tienthuong.TienThuongNgoaiGio;
import edu.ut.hrm.models.tienthuong.TienThuongNgoaiTinh;
import edu.ut.hrm.models.tienthuong.TienThuongThongThuong;

public class TienThuongTests {
    private static final double EPSILON = 1e-9;

    public void runAll() {
        testTinhTienThuongNgoaiGio();
        testTinhTienThuongNgoaiTinh();
        testTinhTienThuongThongThuong();
        testNgoaiGioThrowKhiLuongAm();
        testNgoaiTinhThrowKhiLuongAm();
        testThongThuongThrowKhiLuongAm();
    }

    private void testTinhTienThuongNgoaiGio() {
        TienThuongNgoaiGio strategy = new TienThuongNgoaiGio();
        double result = strategy.tinhTienThuong(2_000.0);
        HrmAssertions.assertEquals(3_000.0, result, EPSILON, "TienThuongNgoaiGio tinh sai");
    }

    private void testTinhTienThuongNgoaiTinh() {
        TienThuongNgoaiTinh strategy = new TienThuongNgoaiTinh();
        double result = strategy.tinhTienThuong(2_000.0);
        HrmAssertions.assertEquals(2_400.0, result, EPSILON, "TienThuongNgoaiTinh tinh sai");
    }

    private void testTinhTienThuongThongThuong() {
        TienThuongThongThuong strategy = new TienThuongThongThuong();
        double result = strategy.tinhTienThuong(2_000.0);
        HrmAssertions.assertEquals(1_000.0, result, EPSILON, "TienThuongThongThuong tinh sai");
    }

    private void testNgoaiGioThrowKhiLuongAm() {
        TienThuongNgoaiGio strategy = new TienThuongNgoaiGio();
        HrmAssertions.assertThrows(
                IllegalArgumentException.class,
                () -> strategy.tinhTienThuong(-1),
                "TienThuongNgoaiGio phai throw khi luong am"
        );
    }

    private void testNgoaiTinhThrowKhiLuongAm() {
        TienThuongNgoaiTinh strategy = new TienThuongNgoaiTinh();
        HrmAssertions.assertThrows(
                IllegalArgumentException.class,
                () -> strategy.tinhTienThuong(-1),
                "TienThuongNgoaiTinh phai throw khi luong am"
        );
    }

    private void testThongThuongThrowKhiLuongAm() {
        TienThuongThongThuong strategy = new TienThuongThongThuong();
        HrmAssertions.assertThrows(
                IllegalArgumentException.class,
                () -> strategy.tinhTienThuong(-1),
                "TienThuongThongThuong phai throw khi luong am"
        );
    }
}
