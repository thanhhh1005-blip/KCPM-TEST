package edu.ut.hrm.models.tienthuong;

import edu.ut.hrm.interfaces.ITienThuong;

public class TienThuongNgoaiTinh implements ITienThuong {
    private static final double HE_SO_NGOAI_TINH = 1.2;

    @Override
    public double tinhTienThuong(double luongCB) {
        if (luongCB < 0) {
            throw new IllegalArgumentException("Lương cơ bản không hợp lệ (âm) để tính thưởng ngoài tỉnh.");
        }
        return luongCB * HE_SO_NGOAI_TINH;
    }
}
