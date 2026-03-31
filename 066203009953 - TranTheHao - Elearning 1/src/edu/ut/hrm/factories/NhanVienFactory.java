package edu.ut.hrm.factories;

import edu.ut.hrm.interfaces.INhanVienFactory;
import edu.ut.hrm.models.ChuyenVienPhanTich;
import edu.ut.hrm.models.KeToanVien;
import edu.ut.hrm.models.LapTrinhVien;
import edu.ut.hrm.models.NhanVien;
import edu.ut.hrm.models.NhanVienKiemThu;
import edu.ut.hrm.models.tienthuong.TienThuongNgoaiGio;
import edu.ut.hrm.models.tienthuong.TienThuongNgoaiTinh;
import edu.ut.hrm.models.tienthuong.TienThuongThongThuong;

import java.util.Locale;

public class NhanVienFactory implements INhanVienFactory {
    private static final String AUTO_MA_SO = "AUTO-001";
    private static final String AUTO_HO_TEN = "Chua cap nhat";
    private static final double AUTO_LUONG_CO_BAN = 10_000_000;

    @Override
    public NhanVien createNhanVien(String loaiNhanVien, String maSo, String hoTen, double luongCoBan) {
        validateInput(loaiNhanVien, maSo, hoTen, luongCoBan);
        String loaiChuanHoa = normalizeLoaiNhanVien(loaiNhanVien);

        NhanVien nhanVien = switch (loaiChuanHoa) {
            case "LAPTRINHVIEN" -> new LapTrinhVien(maSo, hoTen, luongCoBan);
            case "KETOANVIEN" -> new KeToanVien(maSo, hoTen, luongCoBan);
            case "NHANVIENKIEMTHU" -> new NhanVienKiemThu(maSo, hoTen, luongCoBan);
            case "CHUYENVIENPHANTICH" -> new ChuyenVienPhanTich(maSo, hoTen, luongCoBan);
            default -> throw new IllegalArgumentException("Loai nhan vien khong hop le: " + loaiNhanVien);
        };

        ganChienLuocThuongMacDinh(nhanVien, loaiChuanHoa);
        return nhanVien;
    }

    @Override
    public NhanVien createNhanVien(String loaiNhanVien) {
        return createNhanVien(loaiNhanVien, AUTO_MA_SO, AUTO_HO_TEN, AUTO_LUONG_CO_BAN);
    }

    private void ganChienLuocThuongMacDinh(NhanVien nhanVien, String loaiChuanHoa) {
        switch (loaiChuanHoa) {
            case "LAPTRINHVIEN", "CHUYENVIENPHANTICH" -> nhanVien.setPhuongThucTinhThuong(new TienThuongNgoaiGio());
            case "KETOANVIEN" -> nhanVien.setPhuongThucTinhThuong(new TienThuongThongThuong());
            case "NHANVIENKIEMTHU" -> nhanVien.setPhuongThucTinhThuong(new TienThuongNgoaiTinh());
            default -> throw new IllegalArgumentException("Loai nhan vien khong hop le: " + loaiChuanHoa);
        }
    }

    private String normalizeLoaiNhanVien(String loaiNhanVien) {
        return loaiNhanVien.trim().toUpperCase(Locale.ROOT).replace("_", "");
    }

    private void validateInput(String loaiNhanVien, String maSo, String hoTen, double luongCoBan) {
        if (loaiNhanVien == null || loaiNhanVien.isBlank()) {
            throw new IllegalArgumentException("Loai nhan vien khong duoc de trong.");
        }
        if (maSo == null || maSo.isBlank()) {
            throw new IllegalArgumentException("Ma so nhan vien khong duoc de trong.");
        }
        if (hoTen == null || hoTen.isBlank()) {
            throw new IllegalArgumentException("Ho ten nhan vien khong duoc de trong.");
        }
        if (luongCoBan < 0) {
            throw new IllegalArgumentException("Luong co ban khong the am.");
        }
    }
}
