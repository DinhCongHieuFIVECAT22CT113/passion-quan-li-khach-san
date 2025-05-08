using Microsoft.EntityFrameworkCore.Migrations;

namespace be_quanlikhachsanapi.Migrations
{
    public partial class AddPhuongThucThanhToanTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Kiểm tra xem bảng đã tồn tại chưa
            migrationBuilder.Sql("IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PhuongThucThanhToan') BEGIN");
            
            migrationBuilder.CreateTable(
                name: "PhuongThucThanhToan",
                columns: table => new
                {
                    MaPhuongThucThanhToan = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    MaHoaDon = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    SoTienCanThanhToan = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PhuongThucThanhToan = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NgayThanhToan = table.Column<DateTime>(type: "datetime2(7)", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2(7)", nullable: true),
                    NgaySua = table.Column<DateTime>(type: "datetime2(7)", nullable: true)
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
                
            migrationBuilder.Sql("END");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PhuongThucThanhToan");
        }
    }
}