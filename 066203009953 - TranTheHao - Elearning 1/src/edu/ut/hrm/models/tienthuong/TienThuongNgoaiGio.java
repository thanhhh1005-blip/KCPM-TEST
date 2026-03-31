package edu.ut.hrm.models.tienthuong;

import edu.ut.hrm.interfaces.ITienThuong;

public class TienThuongNgoaiGio implements ITienThuong {
    private static final double HE_SO_NGOAI_GIO = 1.5;

    @Override
    public double tinhTienThuong(double luongCB) {
        if (luongCB < 0) {
            throw new IllegalArgumentException("Lương cơ bản không hợp lệ (âm) để tính thưởng ngoài giờ.");
        }
        return luongCB * HE_SO_NGOAI_GIO;
    }
}
