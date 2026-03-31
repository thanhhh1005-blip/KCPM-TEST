package edu.ut.hrm.models.tienthuong;

import edu.ut.hrm.interfaces.ITienThuong;

public class TienThuongThongThuong implements ITienThuong {
    private static final double HE_SO_THONG_THUONG = 0.5;

    @Override
    public double tinhTienThuong(double luongCB) {
        if (luongCB < 0) {
            throw new IllegalArgumentException("Lương cơ bản không hợp lệ (âm) để tính thưởng.");
        }
        return luongCB * HE_SO_THONG_THUONG;
    }
}
