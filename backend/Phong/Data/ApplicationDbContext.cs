using Microsoft.EntityFrameworkCore;
using QLKS.Models;

namespace QLKS.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Phong> Phongs { get; set; }
        public DbSet<LoaiPhong> LoaiPhongs { get; set; }
        public DbSet<DatPhong> DatPhongs { get; set; }
        public DbSet<ChiTietDatPhong> ChiTietDatPhongs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure table names
            modelBuilder.Entity<Phong>().ToTable("Phong");
            modelBuilder.Entity<LoaiPhong>().ToTable("LoaiPhong");
            modelBuilder.Entity<DatPhong>().ToTable("DatPhong");
            modelBuilder.Entity<ChiTietDatPhong>().ToTable("ChiTietDatPhong");

            // Configure relationships
            modelBuilder.Entity<Phong>()
                .HasOne(p => p.LoaiPhong)
                .WithMany(lp => lp.Phongs)
                .HasForeignKey(p => p.MaLoaiPhong);

            modelBuilder.Entity<ChiTietDatPhong>()
                .HasOne(ct => ct.DatPhong)
                .WithMany(dp => dp.ChiTietDatPhongs)
                .HasForeignKey(ct => ct.MaDatPhong);

            modelBuilder.Entity<ChiTietDatPhong>()
                .HasOne(ct => ct.LoaiPhong)
                .WithMany()
                .HasForeignKey(ct => ct.MaLoaiPhong);

            modelBuilder.Entity<ChiTietDatPhong>()
                .HasOne(ct => ct.Phong)
                .WithMany()
                .HasForeignKey(ct => ct.MaPhong);
        }
    }
} 