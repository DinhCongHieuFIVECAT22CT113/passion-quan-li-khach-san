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

// Cấu hình Swagger để hiển thị input form dạng ô vuông/hình chữ nhật
builder.Services.AddSwaggerGen(options => {
    options.ConfigureSwagger();
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

// Add custom services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPasswordHasher<KhachHang>, PasswordHasher<KhachHang>>();
builder.Services.AddScoped<ISendEmailServices, SendEmailServices>();
builder.Services.AddScoped<IWriteFileRepository, WriteFileRepository>();
builder.Services.AddScoped<IPhongRepository, PhongRepository>();

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

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
