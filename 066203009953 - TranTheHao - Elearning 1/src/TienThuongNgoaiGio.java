public class TienThuongNgoaiGio implements ITienThuong {
    private static final double TI_LE_THUONG = 0.2;

    @Override
    public double tinhTienThuong(double luongCoBan) {
        return luongCoBan * TI_LE_THUONG;
    }
}
