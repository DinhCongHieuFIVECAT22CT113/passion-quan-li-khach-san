using Microsoft.EntityFrameworkCore;
using be_quanlikhachsanapi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;
using System.Data.SqlClient;
using System.Text.Json;
using be_quanlikhachsanapi.Helpers;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;
using be_quanlikhachsanapi.Configuration;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Đọc connection string từ appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Đang thử kết nối đến: {connectionString}");

// Cấu hình API Controllers
builder.Services.AddControllers()
    .AddNewtonsoftJson(options => {
        options.SerializerSettings.Converters.Add(new StringEnumConverter());
        options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
    });

builder.Services.AddEndpointsApiExplorer();

// Cấu hình Swagger để gửi Token
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme.\\n\\n" +
                      "Enter your token in the text input below (the 'Bearer ' prefix will be added automatically if not present)."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new List<string>()
        }
    });
});

builder.Services.AddSwaggerGenNewtonsoftSupport();

// Cấu hình XML comments cho Swagger
builder.Services.Configure<SwaggerGenOptions>(options => {
    options.CustomSchemaIds(type => type.FullName);
});

// Add DbContext - sử dụng connection string từ appsettings.json
builder.Services.AddDbContext<QuanLyKhachSanContext>(options =>
    options.UseSqlServer(connectionString));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// THÊM CORS policy mới với credentials
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowCredentials",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000")
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .WithExposedHeaders("Content-Disposition", "Content-Length", "Content-Type")
                   .AllowCredentials();
        });
});

// Add Memory Cache
builder.Services.AddMemoryCache();

// Add Supabase
builder.Services.AddSingleton<Supabase.Client>(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    var url = configuration["Supabase:Url"] ?? throw new InvalidOperationException("Supabase URL not found");
    var key = configuration["Supabase:ServiceKey"] ?? throw new InvalidOperationException("Supabase Service Key not found");
    
    var options = new Supabase.SupabaseOptions
    {
        AutoConnectRealtime = false
    };
    
    return new Supabase.Client(url, key, options);
});

// Add custom services
builder.Services.AddScoped<IRefreshTokenService, RefreshTokenService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ISendEmailServices, SendEmailServices>();
builder.Services.AddScoped<ISupabaseStorageService, SupabaseStorageService>();
builder.Services.AddScoped<IWriteFileRepository, WriteFileRepository>();
builder.Services.AddScoped<IImageMigrationService, ImageMigrationService>();
builder.Services.AddScoped<IPhongRepository, PhongRepository>();
builder.Services.AddScoped<ILoaiPhongRepository, LoaiPhongRepository>();
builder.Services.AddScoped<IDichVuRepository, DichVuRepository>();
builder.Services.AddScoped<IKhuyenMaiRepository, KhuyenMaiRepository>();
builder.Services.AddScoped<ICaLamViecRepository, CaLamViecRepository>();
builder.Services.AddScoped<IPhanCongCaRepository, PhanCongCaRepository>();
builder.Services.AddScoped<IApDungKMRepository, ApDungKMRepository>();
builder.Services.AddScoped<ISuDungDichVuRepository, SuDungDichVuRepository>();
builder.Services.AddScoped<IHoaDonRepository, HoaDonRepository>();
builder.Services.AddScoped<IPhuongThucThanhToanRepository, PhuongThucThanhToanRepository>();
builder.Services.AddScoped<IKhachHangRepository, KhachHangRepository>();
builder.Services.AddScoped<INhanVienRepository, NhanVienRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<ILoaiKhachHangRepository, LoaiKhachHangRepository>();
// Thêm vào phần đăng ký services
builder.Services.AddScoped<IDatPhongRepository, DatPhongRepository>();
builder.Services.AddScoped<IChiTietDatPhongRepository, ChiTietDatPhongRepository>();

builder.Services.AddScoped<IPasswordHasher<KhachHang>, PasswordHasher<KhachHang>>();
builder.Services.AddScoped<IPasswordHasher<NhanVien>, PasswordHasher<NhanVien>>();


// Add Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                builder.Configuration["TokenKey"] ?? throw new InvalidOperationException("TokenKey not found"))),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

var app = builder.Build();

// Kiểm tra kết nối cơ sở dữ liệu
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<QuanLyKhachSanContext>();
    dbContext.Database.OpenConnection();
    Console.WriteLine("Kết nối cơ sở dữ liệu thành công!");
    dbContext.Database.CloseConnection();
}
catch (Exception ex)
{
    Console.WriteLine($"Lỗi kết nối cơ sở dữ liệu: {ex.Message}");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuanLyKhachSan API v1");
        c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
        c.DefaultModelsExpandDepth(-1); // Ẩn schema mặc định ở phía dưới trang
        c.DisplayRequestDuration();
    });
}
app.UseStaticFiles(); // phải có để đọc wwwroot

app.UseCors("AllowCredentials");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

