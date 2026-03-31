package edu.ut.hrm.models;

import edu.ut.hrm.interfaces.ITienThuong;

import java.util.Objects;

public abstract class NhanVien {
    private String maSo;
    private String hoTen;
    private double luongCoBan;
    private ITienThuong phuongThucTinhThuong;

    protected NhanVien(String maSo, String hoTen, double luongCoBan) {
        setMaSo(maSo);
        setHoTen(hoTen);
        setLuongCoBan(luongCoBan);
    }

    public String getMaSo() {
        return maSo;
    }

    public final void setMaSo(String maSo) {
        if (maSo == null || maSo.isBlank()) {
            throw new IllegalArgumentException("Mã số nhân viên không được để trống.");
        }
        this.maSo = maSo.trim();
    }

    public String getHoTen() {
        return hoTen;
    }

    public final void setHoTen(String hoTen) {
        if (hoTen == null || hoTen.isBlank()) {
            throw new IllegalArgumentException("Họ tên nhân viên không được để trống.");
        }
        this.hoTen = hoTen.trim();
    }

    public double getLuongCoBan() {
        return luongCoBan;
    }

    public final void setLuongCoBan(double luongCoBan) {
        if (luongCoBan < 0) {
            throw new IllegalArgumentException("Lương cơ bản không thể âm.");
        }
        this.luongCoBan = luongCoBan;
    }

    public ITienThuong getPhuongThucTinhThuong() {
        return phuongThucTinhThuong;
    }

    public final void setPhuongThucTinhThuong(ITienThuong phuongThucTinhThuong) {
        this.phuongThucTinhThuong = Objects.requireNonNull(
                phuongThucTinhThuong,
                "Phương thức tính thưởng không được null."
        );
    }

    public double getTienThuong() {
        if (phuongThucTinhThuong == null) {
            return 0;
        }
        return phuongThucTinhThuong.tinhTienThuong(luongCoBan);
    }

    @Override
    public String toString() {
        return getClass().getSimpleName()
                + "{maSo='" + maSo + '\''
                + ", hoTen='" + hoTen + '\''
                + ", luongCoBan=" + luongCoBan
                + ", tienThuong=" + getTienThuong()
                + '}';
    }
}
