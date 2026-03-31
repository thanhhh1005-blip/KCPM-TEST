package edu.ut.hrm;

import edu.ut.hrm.factories.NhanVienFactory;
import edu.ut.hrm.interfaces.INhanVienFactory;
import edu.ut.hrm.models.NhanVien;
import edu.ut.hrm.models.tienthuong.TienThuongNgoaiGio;

public class Main {
    public static void main(String[] args) {
        INhanVienFactory factory = new NhanVienFactory();

        NhanVien dev = factory.createNhanVien("LAPTRINHVIEN", "DEV01", "Hao", 2_000.0);
        dev.setPhuongThucTinhThuong(new TienThuongNgoaiGio());

        System.out.println("Tien thuong: " + dev.getTienThuong());
        System.out.println(dev);
    }
}
