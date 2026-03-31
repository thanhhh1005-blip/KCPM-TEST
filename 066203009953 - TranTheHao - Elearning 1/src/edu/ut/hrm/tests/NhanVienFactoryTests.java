package edu.ut.hrm.tests;

import edu.ut.hrm.factories.NhanVienFactory;
import edu.ut.hrm.models.ChuyenVienPhanTich;
import edu.ut.hrm.models.KeToanVien;
import edu.ut.hrm.models.LapTrinhVien;
import edu.ut.hrm.models.NhanVien;
import edu.ut.hrm.models.NhanVienKiemThu;
import edu.ut.hrm.models.tienthuong.TienThuongNgoaiGio;
import edu.ut.hrm.models.tienthuong.TienThuongNgoaiTinh;
import edu.ut.hrm.models.tienthuong.TienThuongThongThuong;

public class NhanVienFactoryTests {
    public void runAll() {
        testCreateLapTrinhVien();
        testCreateKeToanVien();
        testCreateNhanVienKiemThu();
        testCreateChuyenVienPhanTich();
        testCreateNhanVienKhongHopLe();
        testCreateNhanVienVoiInputRong();
        testSetPhuongThucTinhThuongKhongChoNull();
    }

    private void testCreateLapTrinhVien() {
        NhanVienFactory factory = new NhanVienFactory();
        NhanVien nv = factory.createNhanVien("LAPTRINHVIEN", "DEV01", "Hao", 2_000.0);
        HrmAssertions.assertTrue(nv instanceof LapTrinhVien, "Factory phai tao LapTrinhVien");
        HrmAssertions.assertTrue(
                nv.getPhuongThucTinhThuong() instanceof TienThuongNgoaiGio,
                "LapTrinhVien phai mac dinh TienThuongNgoaiGio"
        );
    }

    private void testCreateKeToanVien() {
        NhanVienFactory factory = new NhanVienFactory();
        NhanVien nv = factory.createNhanVien("KETOANVIEN", "ACC01", "Lan", 2_000.0);
        HrmAssertions.assertTrue(nv instanceof KeToanVien, "Factory phai tao KeToanVien");
        HrmAssertions.assertTrue(
                nv.getPhuongThucTinhThuong() instanceof TienThuongThongThuong,
                "KeToanVien phai mac dinh TienThuongThongThuong"
        );
    }

    private void testCreateNhanVienKiemThu() {
        NhanVienFactory factory = new NhanVienFactory();
        NhanVien nv = factory.createNhanVien("NHANVIENKIEMTHU", "QA01", "Minh", 2_000.0);
        HrmAssertions.assertTrue(nv instanceof NhanVienKiemThu, "Factory phai tao NhanVienKiemThu");
        HrmAssertions.assertTrue(
                nv.getPhuongThucTinhThuong() instanceof TienThuongNgoaiTinh,
                "NhanVienKiemThu phai mac dinh TienThuongNgoaiTinh"
        );
    }

    private void testCreateChuyenVienPhanTich() {
        NhanVienFactory factory = new NhanVienFactory();
        NhanVien nv = factory.createNhanVien("CHUYENVIENPHANTICH", "BA01", "Dung", 2_000.0);
        HrmAssertions.assertTrue(nv instanceof ChuyenVienPhanTich, "Factory phai tao ChuyenVienPhanTich");
        HrmAssertions.assertTrue(
                nv.getPhuongThucTinhThuong() instanceof TienThuongNgoaiGio,
                "ChuyenVienPhanTich phai mac dinh TienThuongNgoaiGio"
        );
    }

    private void testCreateNhanVienKhongHopLe() {
        NhanVienFactory factory = new NhanVienFactory();
        HrmAssertions.assertThrows(
                IllegalArgumentException.class,
                () -> factory.createNhanVien("SALE", "S01", "Tuan", 2_000.0),
                "Factory phai throw voi loai nhan vien khong hop le"
        );
    }

    private void testCreateNhanVienVoiInputRong() {
        NhanVienFactory factory = new NhanVienFactory();
        HrmAssertions.assertThrows(
                IllegalArgumentException.class,
                () -> factory.createNhanVien(" ", "S01", "Tuan", 2_000.0),
                "Factory phai throw voi loai nhan vien rong"
        );
        HrmAssertions.assertThrows(
                IllegalArgumentException.class,
                () -> factory.createNhanVien("LAPTRINHVIEN", " ", "Tuan", 2_000.0),
                "Factory phai throw voi ma so rong"
        );
        HrmAssertions.assertThrows(
                IllegalArgumentException.class,
                () -> factory.createNhanVien("LAPTRINHVIEN", "S01", " ", 2_000.0),
                "Factory phai throw voi ho ten rong"
        );
        HrmAssertions.assertThrows(
                IllegalArgumentException.class,
                () -> factory.createNhanVien("LAPTRINHVIEN", "S01", "Tuan", -1),
                "Factory phai throw voi luong am"
        );
    }

    private void testSetPhuongThucTinhThuongKhongChoNull() {
        NhanVienFactory factory = new NhanVienFactory();
        NhanVien nv = factory.createNhanVien("LAPTRINHVIEN", "DEV01", "Hao", 2_000.0);
        HrmAssertions.assertThrows(
                NullPointerException.class,
                () -> nv.setPhuongThucTinhThuong(null),
                "NhanVien phai chan set strategy null"
        );
    }
}
