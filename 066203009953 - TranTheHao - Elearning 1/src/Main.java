public class Main {
    public static void main(String[] args) {
        INhanVienFactory factory = new NhanVienFactory();

        NhanVien lapTrinhVien = factory.createNhanVien("LapTrinhVien", "NV001", "Nguyen Van A", 15_000_000);
        NhanVien keToanVien = factory.createNhanVien("KeToanVien", "NV002", "Tran Thi B", 12_000_000);
        NhanVien kiemThuVien = factory.createNhanVien("NhanVienKiemThu", "NV003", "Le Van C", 13_000_000);
        NhanVien phanTichVien = factory.createNhanVien("ChuyenVienPhanTich");

        System.out.println(lapTrinhVien);
        System.out.println(keToanVien);
        System.out.println(kiemThuVien);
        System.out.println(phanTichVien);
    }
}
