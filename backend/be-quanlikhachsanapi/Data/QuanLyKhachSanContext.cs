using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace be_quanlikhachsanapi.Data;

public partial class QuanLyKhachSanContext : DbContext
{
    public QuanLyKhachSanContext()
    {
    }

    public QuanLyKhachSanContext(DbContextOptions<QuanLyKhachSanContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ApDungKm> ApDungKms { get; set; }

    public virtual DbSet<BaoCaoDoanhThu> BaoCaoDoanhThus { get; set; }

    public virtual DbSet<CaLamViec> CaLamViecs { get; set; }

    public virtual DbSet<ChiTietDatPhong> ChiTietDatPhongs { get; set; }

    public virtual DbSet<DatPhong> DatPhongs { get; set; }

    public virtual DbSet<DichVu> DichVus { get; set; }

    public virtual DbSet<HoaDon> HoaDons { get; set; }

    public virtual DbSet<KhachHang> KhachHangs { get; set; }

    public virtual DbSet<KhuyenMai> KhuyenMais { get; set; }

    public virtual DbSet<LoaiKhachHang> LoaiKhachHangs { get; set; }

    public virtual DbSet<LoaiPhong> LoaiPhongs { get; set; }

    public virtual DbSet<NhanVien> NhanViens { get; set; }

    public virtual DbSet<PhanCong> PhanCongs { get; set; }

    public virtual DbSet<PhanQuyenNhanVien> PhanQuyenNhanViens { get; set; }

    public virtual DbSet<Phong> Phongs { get; set; }

    public virtual DbSet<PhuongThucThanhToan> PhuongThucThanhToans { get; set; }

    public virtual DbSet<Review> Reviews { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<SuDungDichVu> SuDungDichVus { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApDungKm>(entity =>
        {
            entity.HasKey(e => e.MaApDung);

            entity.ToTable("ApDungKM");

            entity.Property(e => e.MaApDung)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaDatPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaKm)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaKM");
            entity.Property(e => e.SoTienGiam).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.MaDatPhongNavigation).WithMany(p => p.ApDungKms)
                .HasForeignKey(d => d.MaDatPhong)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApDungKM_DatPhong");

            entity.HasOne(d => d.MaKmNavigation).WithMany(p => p.ApDungKms)
                .HasForeignKey(d => d.MaKm)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ApDungKM_KhuyenMai");
        });

        modelBuilder.Entity<BaoCaoDoanhThu>(entity =>
        {
            entity.HasKey(e => e.MaBaoCao).HasName("PK_BaoCao");

            entity.ToTable("BaoCaoDoanhThu");

            entity.Property(e => e.MaBaoCao)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaNv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaNV");
            entity.Property(e => e.TongDoanhThu).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.MaNvNavigation).WithMany(p => p.BaoCaoDoanhThus)
                .HasForeignKey(d => d.MaNv)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BaoCaoDoanhThu_NhanVien");
        });

        modelBuilder.Entity<CaLamViec>(entity =>
        {
            entity.HasKey(e => e.MaCaLam);

            entity.ToTable("CaLamViec");

            entity.Property(e => e.MaCaLam)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.TenCaLam).HasMaxLength(150);
        });

        modelBuilder.Entity<ChiTietDatPhong>(entity =>
        {
            entity.HasKey(e => e.MaChiTietDatPhong);

            entity.ToTable("ChiTietDatPhong");

            entity.Property(e => e.MaChiTietDatPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.GiaTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MaDatPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaLoaiPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.ThanhTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThai).HasMaxLength(50);

            entity.HasOne(d => d.MaDatPhongNavigation).WithMany(p => p.ChiTietDatPhongs)
                .HasForeignKey(d => d.MaDatPhong)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChiTietDatPhong_DatPhong");

            entity.HasOne(d => d.MaLoaiPhongNavigation).WithMany(p => p.ChiTietDatPhongs)
                .HasForeignKey(d => d.MaLoaiPhong)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ChiTietDatPhong_LoaiPhong");

            entity.HasOne(d => d.MaPhongNavigation).WithMany(p => p.ChiTietDatPhongs)
                .HasForeignKey(d => d.MaPhong)
                .HasConstraintName("FK_ChiTietDatPhong_Phong");
        });

        modelBuilder.Entity<DatPhong>(entity =>
        {
            entity.HasKey(e => e.MaDatPhong);

            entity.ToTable("DatPhong");

            entity.Property(e => e.MaDatPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.GiaGoc).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MaKh)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaKH");
            entity.Property(e => e.NgayNhanPhong).HasColumnType("datetime");
            entity.Property(e => e.NgayTraPhong).HasColumnType("datetime");
            entity.Property(e => e.ThoiGianDen)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.TongTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("Chờ xác nhận");

            entity.HasOne(d => d.MaKhNavigation).WithMany(p => p.DatPhongs)
                .HasForeignKey(d => d.MaKh)
                .HasConstraintName("FK_DatPhong_KhachHang");
        });

        modelBuilder.Entity<DichVu>(entity =>
        {
            entity.HasKey(e => e.MaDichVu);

            entity.ToTable("DichVu");

            entity.Property(e => e.MaDichVu)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.DonGia).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MoTa).HasMaxLength(500);
            entity.Property(e => e.TenDichVu).HasMaxLength(150);
        });

        modelBuilder.Entity<HoaDon>(entity =>
        {
            entity.HasKey(e => e.MaHoaDon);

            entity.ToTable("HoaDon");

            entity.Property(e => e.MaHoaDon)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.GiamGiaLoaiKh)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("GiamGiaLoaiKH");
            entity.Property(e => e.GiamGiaLoaiKm)
                .HasColumnType("decimal(18, 2)")
                .HasColumnName("GiamGiaLoaiKM");
            entity.Property(e => e.MaDatPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaKm)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaKM");
            entity.Property(e => e.SoTienConThieu).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SoTienDaThanhToan).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SoTienThanhToanDu).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TongTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("Chưa thanh toán");

            entity.HasOne(d => d.MaDatPhongNavigation).WithMany(p => p.HoaDons)
                .HasForeignKey(d => d.MaDatPhong)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_HoaDon_DatPhong");

            entity.HasOne(d => d.MaKmNavigation).WithMany(p => p.HoaDons)
                .HasForeignKey(d => d.MaKm)
                .HasConstraintName("FK_HoaDon_KhuyenMai");
        });

        modelBuilder.Entity<KhachHang>(entity =>
        {
            entity.HasKey(e => e.MaKh);

            entity.ToTable("KhachHang");

            entity.Property(e => e.MaKh)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaKH");
            entity.Property(e => e.DiaChi).HasColumnType("text");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.HoKh)
                .HasMaxLength(50)
                .HasColumnName("HoKH");
            entity.Property(e => e.MaLoaiKh)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaLoaiKH");
            entity.Property(e => e.MaRole)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.NgaySua).HasColumnType("datetime");
            entity.Property(e => e.NgayTao).HasColumnType("datetime");
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Sdt)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("SDT");
            entity.Property(e => e.SoCccd)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("SoCCCD");
            entity.Property(e => e.TenKh)
                .HasMaxLength(50)
                .HasColumnName("TenKH");
            entity.Property(e => e.UserName)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.MaLoaiKhNavigation).WithMany(p => p.KhachHangs)
                .HasForeignKey(d => d.MaLoaiKh)
                .HasConstraintName("FK_KhachHang_LoaiKhachHang");

            entity.HasOne(d => d.MaRoleNavigation).WithMany(p => p.KhachHangs)
                .HasForeignKey(d => d.MaRole)
                .HasConstraintName("FK_KhachHang_Role");
        });

        modelBuilder.Entity<KhuyenMai>(entity =>
        {
            entity.HasKey(e => e.MaKm);

            entity.ToTable("KhuyenMai");

            entity.Property(e => e.MaKm)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaKM");
            entity.Property(e => e.MaGiamGia)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MoTa).HasColumnType("text");
            entity.Property(e => e.NgayBatDau).HasColumnType("datetime");
            entity.Property(e => e.NgayKetThuc).HasColumnType("datetime");
            entity.Property(e => e.SoTienGiam).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TenKhuyenMai).HasMaxLength(150);
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("Hoạt động");
        });

        modelBuilder.Entity<LoaiKhachHang>(entity =>
        {
            entity.HasKey(e => e.MaLoaiKh);

            entity.ToTable("LoaiKhachHang");

            entity.Property(e => e.MaLoaiKh)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaLoaiKH");
            entity.Property(e => e.MoTa).HasColumnType("text");
            entity.Property(e => e.TenLoaiKh)
                .HasMaxLength(50)
                .HasColumnName("TenLoaiKH");
            entity.Property(e => e.UuDai).HasMaxLength(250);
        });

        modelBuilder.Entity<LoaiPhong>(entity =>
        {
            entity.HasKey(e => e.MaLoaiPhong);

            entity.ToTable("LoaiPhong");

            entity.Property(e => e.MaLoaiPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.GiaMoiDem).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.GiaMoiGio).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MoTa).HasColumnType("text");
            entity.Property(e => e.TenLoaiPhong).HasMaxLength(150);
        });

        modelBuilder.Entity<NhanVien>(entity =>
        {
            entity.HasKey(e => e.MaNv);

            entity.ToTable("NhanVien");

            entity.Property(e => e.MaNv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaNV");
            entity.Property(e => e.ChucVu).HasMaxLength(50);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.HoNv)
                .HasMaxLength(50)
                .HasColumnName("HoNV");
            entity.Property(e => e.LuongCoBan).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.MaCaLam)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Sdt)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("SDT");
            entity.Property(e => e.TenNv)
                .HasMaxLength(50)
                .HasColumnName("TenNV");
            entity.Property(e => e.UserName)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.MaCaLamNavigation).WithMany(p => p.NhanViens)
                .HasForeignKey(d => d.MaCaLam)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_NhanVien_CaLamViec");
        });

        modelBuilder.Entity<PhanCong>(entity =>
        {
            entity.HasKey(e => e.MaPhanCong);

            entity.ToTable("PhanCong");

            entity.Property(e => e.MaPhanCong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaCaLam)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaNv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaNV");

            entity.HasOne(d => d.MaCaLamNavigation).WithMany(p => p.PhanCongs)
                .HasForeignKey(d => d.MaCaLam)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PhanCong_CaLamViec");

            entity.HasOne(d => d.MaNvNavigation).WithMany(p => p.PhanCongs)
                .HasForeignKey(d => d.MaNv)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PhanCong_NhanVien");
        });

        modelBuilder.Entity<PhanQuyenNhanVien>(entity =>
        {
            entity.HasKey(e => e.MaNv);

            entity.ToTable("PhanQuyenNhanVien");

            entity.Property(e => e.MaNv)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("MaNV");
            entity.Property(e => e.MaRole)
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.HasOne(d => d.MaNvNavigation).WithOne(p => p.PhanQuyenNhanVien)
                .HasForeignKey<PhanQuyenNhanVien>(d => d.MaNv)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PhanQuyen_NhanVien");

            entity.HasOne(d => d.MaRoleNavigation).WithMany(p => p.PhanQuyenNhanViens)
                .HasForeignKey(d => d.MaRole)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PhanQuyen_Role");
        });

        modelBuilder.Entity<Phong>(entity =>
        {
            entity.HasKey(e => e.MaPhong);

            entity.ToTable("Phong");

            entity.Property(e => e.MaPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaLoaiPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.SoPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50)
                .HasDefaultValue("Trống");

            entity.HasOne(d => d.MaLoaiPhongNavigation).WithMany(p => p.Phongs)
                .HasForeignKey(d => d.MaLoaiPhong)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Phong_LoaiPhong");
        });

        modelBuilder.Entity<PhuongThucThanhToan>(entity =>
        {
            entity.HasKey(e => e.MaPhuongThucThanhToan);
            
            entity.Property(e => e.MaPhuongThucThanhToan)
                .HasMaxLength(10)
                .IsUnicode(false);
            
            entity.Property(e => e.MaHoaDon)
                .HasMaxLength(10)
                .IsUnicode(false);
            
            entity.Property(e => e.SoTienCanThanhToan)
                .HasColumnType("decimal(18, 2)");
            
            entity.Property(e => e.PhuongThucThanhToan1)
                .HasMaxLength(150)
                .HasColumnName("PhuongThucThanhToan");
            
            entity.Property(e => e.TrangThai)
                .HasMaxLength(50);
            
            entity.HasOne(d => d.MaHoaDonNavigation)
                .WithMany()
                .HasForeignKey(d => d.MaHoaDon)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PhuongThucThanhToan_HoaDon");
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.MaReview).HasName("PK_DanhGia");

            entity.ToTable("Review");

            entity.Property(e => e.MaReview)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaDatPhong)
                .HasMaxLength(10)
                .IsUnicode(false);

            entity.HasOne(d => d.MaDatPhongNavigation).WithMany(p => p.Reviews)
                .HasForeignKey(d => d.MaDatPhong)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Review_DatPhong");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.MaRole).HasName("PK_Roles");

            entity.ToTable("Role");

            entity.Property(e => e.MaRole)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.TenRole).HasMaxLength(150);
        });

        modelBuilder.Entity<SuDungDichVu>(entity =>
        {
            entity.HasKey(e => e.MaSuDung);

            entity.ToTable("SuDungDichVu");

            entity.Property(e => e.MaSuDung)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaDatPhong)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.MaDichVu)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.ThoiGianSuDung)
                .IsRowVersion()
                .IsConcurrencyToken();
            entity.Property(e => e.TongTien).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TrangThai).HasMaxLength(50);

            entity.HasOne(d => d.MaDatPhongNavigation).WithMany(p => p.SuDungDichVus)
                .HasForeignKey(d => d.MaDatPhong)
                .HasConstraintName("FK_SuDungDichVu_DatPhong");

            entity.HasOne(d => d.MaDichVuNavigation).WithMany(p => p.SuDungDichVus)
                .HasForeignKey(d => d.MaDichVu)
                .HasConstraintName("FK_SuDungDichVu_DichVu");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
