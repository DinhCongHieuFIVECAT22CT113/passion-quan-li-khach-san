using System;
using System.Data.SqlClient;
using System.IO;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace be_quanlikhachsanapi.Helpers
{
    public static class DatabaseHelper
    {
        public static string GetConnectionString(IConfiguration config)
        {
            string dbConfigPath = Path.Combine(Directory.GetCurrentDirectory(), "database-config.json");
            string connectionString = config.GetConnectionString("DefaultConnection") 
                ?? throw new InvalidOperationException("Không tìm thấy chuỗi kết nối trong appsettings.json");

            try
            {
                if (File.Exists(dbConfigPath))
                {
                    string dbConfigContent = File.ReadAllText(dbConfigPath);
                    var dbConfig = JsonSerializer.Deserialize<JsonDocument>(dbConfigContent);
                    if (dbConfig != null)
                    {
                        if (dbConfig.RootElement.TryGetProperty("CurrentConnection", out var connectionTypeProp) &&
                            connectionTypeProp.ValueKind == JsonValueKind.String)
                        {
                            string connectionType = connectionTypeProp.GetString() ?? "LocalDB";
                            Console.WriteLine($"Sử dụng cấu hình kết nối: {connectionType}");

                            if (dbConfig.RootElement.TryGetProperty("ConnectionOptions", out var connectionOptionsProp) &&
                                connectionOptionsProp.ValueKind == JsonValueKind.Object &&
                                connectionOptionsProp.TryGetProperty(connectionType, out var specificConnectionProp) &&
                                specificConnectionProp.ValueKind == JsonValueKind.String)
                            {
                                string customConnection = specificConnectionProp.GetString();
                                if (!string.IsNullOrEmpty(customConnection))
                                {
                                    connectionString = customConnection;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi đọc cấu hình database: {ex.Message}");
                // Vẫn giữ lại chuỗi kết nối mặc định từ appsettings.json
            }

            return connectionString;
        }

        public static bool TestSqlConnection(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
            {
                Console.WriteLine("Chuỗi kết nối không được cung cấp");
                return false;
            }

            try
            {
                using (SqlConnection connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    Console.WriteLine("Kết nối SQL Server thành công!");
                    Console.WriteLine($"SQL Server Version: {connection.ServerVersion}");
                    connection.Close();
                    return true;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi kết nối SQL Server: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                return false;
            }
        }
    }
} 