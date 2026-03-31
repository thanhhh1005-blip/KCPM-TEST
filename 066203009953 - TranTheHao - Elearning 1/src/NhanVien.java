public abstract class NhanVien {
    protected String maSo;
    protected String hoTen;
    protected double luongCoBan;
    protected ITienThuong phuongThucTinhThuong;

    public NhanVien() {
    }

    public NhanVien(String maSo, String hoTen, double luongCoBan, ITienThuong phuongThucTinhThuong) {
        this.maSo = maSo;
        this.hoTen = hoTen;
        this.luongCoBan = luongCoBan;
        this.phuongThucTinhThuong = phuongThucTinhThuong;
    }

    public String getMaSo() {
        return maSo;
    }

    public void setMaSo(String maSo) {
        this.maSo = maSo;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public double getLuongCoBan() {
        return luongCoBan;
    }

    public void setLuongCoBan(double luongCoBan) {
        this.luongCoBan = luongCoBan;
    }

    public ITienThuong getPhuongThucTinhThuong() {
        return phuongThucTinhThuong;
    }

    public void setPhuongThucTinhThuong(ITienThuong phuongThucTinhThuong) {
        this.phuongThucTinhThuong = phuongThucTinhThuong;
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
