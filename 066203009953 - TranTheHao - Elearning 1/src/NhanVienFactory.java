public class NhanVienFactory implements INhanVienFactory {
    private static final String MA_SO_MAC_DINH = "AUTO-001";
    private static final String HO_TEN_MAC_DINH = "Chua cap nhat";
    private static final double LUONG_MAC_DINH = 10_000_000;

    @Override
    public NhanVien createNhanVien(String loaiNhanVien, String maSo, String hoTen, double luongCoBan) {
        return switch (loaiNhanVien) {
            case "LapTrinhVien" -> new LapTrinhVien(maSo, hoTen, luongCoBan, new TienThuongNgoaiGio());
            case "KeToanVien" -> new KeToanVien(maSo, hoTen, luongCoBan, new TienThuongThongThuong());
            case "NhanVienKiemThu" -> new NhanVienKiemThu(maSo, hoTen, luongCoBan, new TienThuongNgoaiTinh());
            case "ChuyenVienPhanTich" -> new ChuyenVienPhanTich(maSo, hoTen, luongCoBan, new TienThuongNgoaiGio());
            default -> throw new IllegalArgumentException("Loai nhan vien khong hop le: " + loaiNhanVien);
        };
    }

    @Override
    public NhanVien createNhanVien(String loaiNhanVien) {
        return createNhanVien(loaiNhanVien, MA_SO_MAC_DINH, HO_TEN_MAC_DINH, LUONG_MAC_DINH);
    }
}
