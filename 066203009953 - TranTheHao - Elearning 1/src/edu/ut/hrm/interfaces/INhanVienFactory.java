package edu.ut.hrm.interfaces;

import edu.ut.hrm.models.NhanVien;

public interface INhanVienFactory {
    NhanVien createNhanVien(String loaiNhanVien, String maSo, String hoTen, double luongCoBan);

    NhanVien createNhanVien(String loaiNhanVien);
}
