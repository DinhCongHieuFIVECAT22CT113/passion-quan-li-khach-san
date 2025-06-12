using Microsoft.EntityFrameworkCore;
using be_quanlikhachsanapi.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using be_quanlikhachsanapi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;
using System.Text.Json;
using be_quanlikhachsanapi.Helpers;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;
using be_quanlikhachsanapi.Configuration;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using Microsoft.AspNetCore.SignalR;
using be_quanlikhachsanapi.Hubs;

var builder = WebApplication.CreateBuilder(args);

// ✅ Cấu hình Kestrel với dynamic port cho Render
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(int.Parse(port));
});

Console.WriteLine($"🚀 Server sẽ chạy trên port: {port}");

// ✅ Connection String
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Đang thử kết nối đến: {connectionString}");

// ✅ Cấu hình Controller với NewtonsoftJson
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.Converters.Add(new StringEnumConverter());
        options.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token vào đây (không cần chữ 'Bearer ')"
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
builder.Services.Configure<SwaggerGenOptions>(opt => opt.CustomSchemaIds(type => type.FullName));

// ✅ Cấu hình EF DbContext
builder.Services.AddDbContext<DataQlks113Nhom2Context>(opt =>
    opt.UseSqlServer(connectionString));

// ✅ CORS
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ??
                         new[] {
                             "http://localhost:3000",
                             "https://passion-quan-li-khach-san-git-main-conghieus-projects.vercel.app",
                             "https://passion-quan-li-khach-san.vercel.app", // Domain Vercel chính
                             "https://passion-quan-li-khach-san.onrender.com" // Thêm domain Render
                         };

    options.AddPolicy("AllowCredentials", cors =>
    {
        cors.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithExposedHeaders("Content-Disposition", "Content-Length", "Content-Type");
    });
});

// ✅ SignalR, Cache, HTTP Accessor
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();
builder.Services.AddHttpContextAccessor();

// ✅ Supabase
builder.Services.AddSingleton<Supabase.Client>(provider =>
{
    var config = provider.GetRequiredService<IConfiguration>();
    var url = config["Supabase:Url"] ?? throw new InvalidOperationException("Supabase URL not found");
    var key = config["Supabase:ServiceKey"] ?? throw new InvalidOperationException("Supabase Service Key not found");

    var options = new Supabase.SupabaseOptions
    {
        AutoConnectRealtime = false
    };

    return new Supabase.Client(url, key, options);
});

// ✅ DI các repository/service
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
builder.Services.AddScoped<IDatPhongRepository, DatPhongRepository>();
builder.Services.AddScoped<IChiTietDatPhongRepository, ChiTietDatPhongRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IBaoCaoRepository, BaoCaoRepository>();
builder.Services.AddScoped<IPasswordHasher<KhachHang>, PasswordHasher<KhachHang>>();
builder.Services.AddScoped<IPasswordHasher<NhanVien>, PasswordHasher<NhanVien>>();

// ✅ JWT Authentication
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

// ✅ Kiểm tra kết nối DB
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<DataQlks113Nhom2Context>();
    dbContext.Database.OpenConnection();
    Console.WriteLine("✅ Kết nối cơ sở dữ liệu thành công!");
    dbContext.Database.CloseConnection();
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Lỗi kết nối CSDL: {ex.Message}");
}

// ✅ Middleware pipeline - Enable Swagger cho cả Development và Production
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "QuanLyKhachSan API v1");
    c.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
    c.DefaultModelsExpandDepth(-1);
    c.DisplayRequestDuration();
    c.RoutePrefix = "swagger"; // Đảm bảo Swagger UI có thể truy cập tại /swagger
});

app.UseStaticFiles();
app.UseCors("AllowCredentials");
// KHÔNG bật HTTPS redirect vì Render không cần
// app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// ✅ Health check endpoint
app.MapGet("/", () => new {
    message = "Hotel Management API is running!",
    timestamp = DateTime.Now,
    environment = app.Environment.EnvironmentName,
    version = "1.0.0"
});

app.MapGet("/api/health", () => new {
    status = "healthy",
    timestamp = DateTime.Now,
    database = "connected" // Sẽ check thực tế sau
});

app.MapControllers();
app.MapHub<NotificationHub>("/notificationHub");

app.Run();
