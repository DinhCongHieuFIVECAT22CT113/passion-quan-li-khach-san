using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace be_quanlikhachsanapi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CaLamViec",
                columns: table => new
                {
                    MaCaLam = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    TenCaLam = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    GioBatDau = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GioKetThuc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CaLamViec", x => x.MaCaLam);
                });

            migrationBuilder.CreateTable(
                name: "DichVu",
                columns: table => new
                {
                    MaDichVu = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    TenDichVu = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DonGia = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DichVu", x => x.MaDichVu);
                });

            migrationBuilder.CreateTable(
                name: "KhuyenMai",
                columns: table => new
                {
                    MaKM = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    TenKhuyenMai = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MoTa = table.Column<string>(type: "text", nullable: false),
                    MaGiamGia = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    PhanTramGiam = table.Column<int>(type: "int", nullable: false),
                    SoTienGiam = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayBatDau = table.Column<DateTime>(type: "datetime", nullable: false),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Hoạt động")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhuyenMai", x => x.MaKM);
                });

            migrationBuilder.CreateTable(
                name: "LoaiKhachHang",
                columns: table => new
                {
                    MaLoaiKH = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    TenLoaiKH = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MoTa = table.Column<string>(type: "text", nullable: true),
                    UuDai = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoaiKhachHang", x => x.MaLoaiKH);
                });

            migrationBuilder.CreateTable(
                name: "LoaiPhong",
                columns: table => new
                {
                    MaLoaiPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    TenLoaiPhong = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MoTa = table.Column<string>(type: "text", nullable: true),
                    GiaMoiGio = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    GiaMoiDem = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoPhongTam = table.Column<int>(type: "int", nullable: false),
                    SoGiuongNgu = table.Column<int>(type: "int", nullable: false),
                    GiuongDoi = table.Column<int>(type: "int", nullable: true),
                    GiuongDon = table.Column<int>(type: "int", nullable: true),
                    KichThuocPhong = table.Column<int>(type: "int", nullable: false),
                    SucChua = table.Column<int>(type: "int", nullable: false),
                    Thumbnail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HinhAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoaiPhong", x => x.MaLoaiPhong);
                });

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    MaRole = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    TenRole = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    MoTa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.MaRole);
                });

            migrationBuilder.CreateTable(
                name: "NhanVien",
                columns: table => new
                {
                    MaNV = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    UserName = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    HoNV = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TenNV = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ChucVu = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SDT = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    MaCaLam = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    LuongCoBan = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    NgayVaoLam = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NhanVien", x => x.MaNV);
                    table.ForeignKey(
                        name: "FK_NhanVien_CaLamViec",
                        column: x => x.MaCaLam,
                        principalTable: "CaLamViec",
                        principalColumn: "MaCaLam");
                });

            migrationBuilder.CreateTable(
                name: "KhachHang",
                columns: table => new
                {
                    MaKH = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    UserName = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    HoKH = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TenKH = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    SDT = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    DiaChi = table.Column<string>(type: "text", nullable: true),
                    SoCCCD = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime", nullable: true),
                    MaLoaiKH = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhachHang", x => x.MaKH);
                    table.ForeignKey(
                        name: "FK_KhachHang_LoaiKhachHang",
                        column: x => x.MaLoaiKH,
                        principalTable: "LoaiKhachHang",
                        principalColumn: "MaLoaiKH");
                });

            migrationBuilder.CreateTable(
                name: "Phong",
                columns: table => new
                {
                    MaPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaLoaiPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    SoPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    Thumbnail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HinhAnh = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Trống"),
                    Tang = table.Column<int>(type: "int", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Phong", x => x.MaPhong);
                    table.ForeignKey(
                        name: "FK_Phong_LoaiPhong",
                        column: x => x.MaLoaiPhong,
                        principalTable: "LoaiPhong",
                        principalColumn: "MaLoaiPhong");
                });

            migrationBuilder.CreateTable(
                name: "BaoCaoDoanhThu",
                columns: table => new
                {
                    MaBaoCao = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    Thang = table.Column<int>(type: "int", nullable: false),
                    Nam = table.Column<int>(type: "int", nullable: false),
                    TongDoanhThu = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TongDatPhong = table.Column<int>(type: "int", nullable: false),
                    TongDichVuDaSuDung = table.Column<int>(type: "int", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MaNV = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaoCao", x => x.MaBaoCao);
                    table.ForeignKey(
                        name: "FK_BaoCaoDoanhThu_NhanVien",
                        column: x => x.MaNV,
                        principalTable: "NhanVien",
                        principalColumn: "MaNV");
                });

            migrationBuilder.CreateTable(
                name: "DatPhong",
                columns: table => new
                {
                    MaDatPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaKH = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    TreEm = table.Column<int>(type: "int", nullable: true),
                    NguoiLon = table.Column<int>(type: "int", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SoLuongPhong = table.Column<int>(type: "int", nullable: true),
                    ThoiGianDen = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    NgayNhanPhong = table.Column<DateTime>(type: "datetime", nullable: false),
                    NgayTraPhong = table.Column<DateTime>(type: "datetime", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Chờ xác nhận"),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GiaGoc = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TongTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DatPhong", x => x.MaDatPhong);
                    table.ForeignKey(
                        name: "FK_DatPhong_KhachHang",
                        column: x => x.MaKH,
                        principalTable: "KhachHang",
                        principalColumn: "MaKH");
                });

            migrationBuilder.CreateTable(
                name: "PhanQuyen",
                columns: table => new
                {
                    MaRole = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaKH = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    MaNV = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhanQuyen", x => x.MaRole);
                    table.ForeignKey(
                        name: "FK_PhanQuyen_KhachHang",
                        column: x => x.MaKH,
                        principalTable: "KhachHang",
                        principalColumn: "MaKH");
                    table.ForeignKey(
                        name: "FK_PhanQuyen_NhanVien",
                        column: x => x.MaNV,
                        principalTable: "NhanVien",
                        principalColumn: "MaNV");
                    table.ForeignKey(
                        name: "FK_PhanQuyen_Role",
                        column: x => x.MaRole,
                        principalTable: "Role",
                        principalColumn: "MaRole");
                });

            migrationBuilder.CreateTable(
                name: "ApDungKM",
                columns: table => new
                {
                    MaApDung = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaKM = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaDatPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    SoTienGiam = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApDungKM", x => x.MaApDung);
                    table.ForeignKey(
                        name: "FK_ApDungKM_DatPhong",
                        column: x => x.MaDatPhong,
                        principalTable: "DatPhong",
                        principalColumn: "MaDatPhong");
                    table.ForeignKey(
                        name: "FK_ApDungKM_KhuyenMai",
                        column: x => x.MaKM,
                        principalTable: "KhuyenMai",
                        principalColumn: "MaKM");
                });

            migrationBuilder.CreateTable(
                name: "ChiTietDatPhong",
                columns: table => new
                {
                    MaChiTietDatPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaDatPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaLoaiPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    SoDem = table.Column<int>(type: "int", nullable: true),
                    GiaTien = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    ThanhTien = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiTietDatPhong", x => x.MaChiTietDatPhong);
                    table.ForeignKey(
                        name: "FK_ChiTietDatPhong_DatPhong",
                        column: x => x.MaDatPhong,
                        principalTable: "DatPhong",
                        principalColumn: "MaDatPhong");
                    table.ForeignKey(
                        name: "FK_ChiTietDatPhong_LoaiPhong",
                        column: x => x.MaLoaiPhong,
                        principalTable: "LoaiPhong",
                        principalColumn: "MaLoaiPhong");
                    table.ForeignKey(
                        name: "FK_ChiTietDatPhong_Phong",
                        column: x => x.MaPhong,
                        principalTable: "Phong",
                        principalColumn: "MaPhong");
                });

            migrationBuilder.CreateTable(
                name: "HoaDon",
                columns: table => new
                {
                    MaHoaDon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaDatPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaKM = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    GiamGiaLoaiKM = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    GiamGiaLoaiKH = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TongTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SoTienDaThanhToan = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SoTienConThieu = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SoTienThanhToanDu = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Chưa thanh toán"),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HoaDon", x => x.MaHoaDon);
                    table.ForeignKey(
                        name: "FK_HoaDon_DatPhong",
                        column: x => x.MaDatPhong,
                        principalTable: "DatPhong",
                        principalColumn: "MaDatPhong");
                    table.ForeignKey(
                        name: "FK_HoaDon_KhuyenMai",
                        column: x => x.MaKM,
                        principalTable: "KhuyenMai",
                        principalColumn: "MaKM");
                });

            migrationBuilder.CreateTable(
                name: "Review",
                columns: table => new
                {
                    MaReview = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaDatPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    DanhGia = table.Column<int>(type: "int", nullable: false),
                    BinhLuan = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DanhGia", x => x.MaReview);
                    table.ForeignKey(
                        name: "FK_DanhGia_DatPhong",
                        column: x => x.MaDatPhong,
                        principalTable: "DatPhong",
                        principalColumn: "MaDatPhong");
                });

            migrationBuilder.CreateTable(
                name: "SuDungDichVu",
                columns: table => new
                {
                    MaSuDung = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaDatPhong = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    MaDichVu = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    SoLuong = table.Column<int>(type: "int", nullable: true),
                    TongTien = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    NgaySuDung = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ThoiGianSuDung = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuDungDichVu", x => x.MaSuDung);
                    table.ForeignKey(
                        name: "FK_SuDungDichVu_DatPhong",
                        column: x => x.MaDatPhong,
                        principalTable: "DatPhong",
                        principalColumn: "MaDatPhong");
                    table.ForeignKey(
                        name: "FK_SuDungDichVu_DichVu",
                        column: x => x.MaDichVu,
                        principalTable: "DichVu",
                        principalColumn: "MaDichVu");
                });

            migrationBuilder.CreateTable(
                name: "PhuongThucThanhToan",
                columns: table => new
                {
                    MaPhuongThucThanhToan = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaHoaDon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    SoTienCanThanhToan = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PhuongThucThanhToan = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NgayThanhToan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhuongThucThanhToan", x => x.MaPhuongThucThanhToan);
                    table.ForeignKey(
                        name: "FK_PhuongThucThanhToan_HoaDon",
                        column: x => x.MaHoaDon,
                        principalTable: "HoaDon",
                        principalColumn: "MaHoaDon");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApDungKM_MaDatPhong",
                table: "ApDungKM",
                column: "MaDatPhong");

            migrationBuilder.CreateIndex(
                name: "IX_ApDungKM_MaKM",
                table: "ApDungKM",
                column: "MaKM");

            migrationBuilder.CreateIndex(
                name: "IX_BaoCaoDoanhThu_MaNV",
                table: "BaoCaoDoanhThu",
                column: "MaNV");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietDatPhong_MaDatPhong",
                table: "ChiTietDatPhong",
                column: "MaDatPhong");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietDatPhong_MaLoaiPhong",
                table: "ChiTietDatPhong",
                column: "MaLoaiPhong");

            migrationBuilder.CreateIndex(
                name: "IX_ChiTietDatPhong_MaPhong",
                table: "ChiTietDatPhong",
                column: "MaPhong");

            migrationBuilder.CreateIndex(
                name: "IX_DatPhong_MaKH",
                table: "DatPhong",
                column: "MaKH");

            migrationBuilder.CreateIndex(
                name: "IX_HoaDon_MaDatPhong",
                table: "HoaDon",
                column: "MaDatPhong");

            migrationBuilder.CreateIndex(
                name: "IX_HoaDon_MaKM",
                table: "HoaDon",
                column: "MaKM");

            migrationBuilder.CreateIndex(
                name: "IX_KhachHang_MaLoaiKH",
                table: "KhachHang",
                column: "MaLoaiKH");

            migrationBuilder.CreateIndex(
                name: "IX_NhanVien_MaCaLam",
                table: "NhanVien",
                column: "MaCaLam");

            migrationBuilder.CreateIndex(
                name: "IX_PhanQuyen_MaKH",
                table: "PhanQuyen",
                column: "MaKH");

            migrationBuilder.CreateIndex(
                name: "IX_PhanQuyen_MaNV",
                table: "PhanQuyen",
                column: "MaNV");

            migrationBuilder.CreateIndex(
                name: "IX_Phong_MaLoaiPhong",
                table: "Phong",
                column: "MaLoaiPhong");

            migrationBuilder.CreateIndex(
                name: "IX_PhuongThucThanhToan_MaHoaDon",
                table: "PhuongThucThanhToan",
                column: "MaHoaDon");

            migrationBuilder.CreateIndex(
                name: "IX_Review_MaDatPhong",
                table: "Review",
                column: "MaDatPhong");

            migrationBuilder.CreateIndex(
                name: "IX_SuDungDichVu_MaDatPhong",
                table: "SuDungDichVu",
                column: "MaDatPhong");

            migrationBuilder.CreateIndex(
                name: "IX_SuDungDichVu_MaDichVu",
                table: "SuDungDichVu",
                column: "MaDichVu");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApDungKM");

            migrationBuilder.DropTable(
                name: "BaoCaoDoanhThu");

            migrationBuilder.DropTable(
                name: "ChiTietDatPhong");

            migrationBuilder.DropTable(
                name: "PhanQuyen");

            migrationBuilder.DropTable(
                name: "PhuongThucThanhToan");

            migrationBuilder.DropTable(
                name: "Review");

            migrationBuilder.DropTable(
                name: "SuDungDichVu");

            migrationBuilder.DropTable(
                name: "Phong");

            migrationBuilder.DropTable(
                name: "NhanVien");

            migrationBuilder.DropTable(
                name: "Role");

            migrationBuilder.DropTable(
                name: "HoaDon");

            migrationBuilder.DropTable(
                name: "DichVu");

            migrationBuilder.DropTable(
                name: "LoaiPhong");

            migrationBuilder.DropTable(
                name: "CaLamViec");

            migrationBuilder.DropTable(
                name: "DatPhong");

            migrationBuilder.DropTable(
                name: "KhuyenMai");

            migrationBuilder.DropTable(
                name: "KhachHang");

            migrationBuilder.DropTable(
                name: "LoaiKhachHang");
        }
    }
}
