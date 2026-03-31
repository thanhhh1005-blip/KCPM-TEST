public class TienThuongThongThuong implements ITienThuong {
    private static final double TI_LE_THUONG = 0.1;

    @Override
    public double tinhTienThuong(double luongCoBan) {
        return luongCoBan * TI_LE_THUONG;
    }
}
