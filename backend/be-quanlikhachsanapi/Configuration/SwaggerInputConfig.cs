using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using System.Linq;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace be_quanlikhachsanapi.Configuration
{
    public static class SwaggerInputConfig
    {
        public static void ConfigureSwagger(this SwaggerGenOptions options)
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Quản Lý Khách Sạn API",
                Version = "v1",
                Description = "API quản lý khách sạn"
            });

            // Bật hiển thị XML comments
            var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
            if (File.Exists(xmlPath))
            {
                options.IncludeXmlComments(xmlPath);
            }

            // Cấu hình JWT Authentication trong Swagger
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Nhập JWT Token",
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
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
                    Array.Empty<string>()
                }
            });

            // Cấu hình để luôn hiển thị form thay vì JSON
            options.CustomSchemaIds(type => type.FullName);
            
            // Thêm filter để hiển thị các HTTP Status codes
            options.OperationFilter<AddResponsesOperationFilter>();
            
            // Thêm filter để hiển thị FromForm thành các ô nhập liệu riêng biệt
            options.OperationFilter<FormFileOperationFilter>();
        }
    }

    // Filter để thêm response codes tự động
    public class AddResponsesOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Tự động thêm các response codes phổ biến
            if (!operation.Responses.ContainsKey("401"))
            {
                operation.Responses.Add("401", new OpenApiResponse { Description = "Không có quyền" });
            }

            if (!operation.Responses.ContainsKey("400"))
            {
                operation.Responses.Add("400", new OpenApiResponse { Description = "Dữ liệu không hợp lệ" });
            }

            if (!operation.Responses.ContainsKey("500"))
            {
                operation.Responses.Add("500", new OpenApiResponse { Description = "Lỗi máy chủ" });
            }

            if (context.ApiDescription.HttpMethod == "POST" && !operation.Responses.ContainsKey("201"))
            {
                operation.Responses.Add("201", new OpenApiResponse { Description = "Tạo thành công" });
            }
            
            if (context.ApiDescription.HttpMethod == "PUT" && !operation.Responses.ContainsKey("204"))
            {
                operation.Responses.Add("204", new OpenApiResponse { Description = "Cập nhật thành công" });
            }
        }
    }
    
    // Filter để chuyển đổi [FromForm] thành các ô nhập liệu riêng biệt
    public class FormFileOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var formParameters = context.ApiDescription.ParameterDescriptions
                .Where(paramDesc => paramDesc.Source == BindingSource.Form)
                .ToList();

            if (formParameters.Count == 0)
                return;

            // Tìm body parameter
            var formBodyContent = operation.RequestBody?.Content
                .FirstOrDefault(x => x.Key == "multipart/form-data").Value;

            // Nếu không có body parameter, thêm mới
            if (formBodyContent == null)
            {
                operation.RequestBody = new OpenApiRequestBody
                {
                    Content = new Dictionary<string, OpenApiMediaType>
                    {
                        ["multipart/form-data"] = new OpenApiMediaType
                        {
                            Schema = new OpenApiSchema
                            {
                                Type = "object",
                                Properties = new Dictionary<string, OpenApiSchema>(),
                                Required = new HashSet<string>()
                            }
                        }
                    }
                };
                formBodyContent = operation.RequestBody.Content["multipart/form-data"];
            }

            // Xóa các tham số ở mức thấp hơn nếu có (được thêm bởi các bộ lọc khác)
            foreach (var formParameter in formParameters)
            {
                var parameterToRemove = operation.Parameters
                    .FirstOrDefault(p => p.Name == formParameter.Name);
                if (parameterToRemove != null)
                {
                    operation.Parameters.Remove(parameterToRemove);
                }
            }

            // Thêm từng trường vào schema của form
            foreach (var formParameter in formParameters)
            {
                var schema = context.SchemaGenerator.GenerateSchema(formParameter.Type, context.SchemaRepository);
                
                // Kiểm tra xem thuộc tính đã tồn tại trong schema chưa
                if (!formBodyContent.Schema.Properties.ContainsKey(formParameter.Name))
                {
                    // Thêm vào properties nếu chưa tồn tại
                    formBodyContent.Schema.Properties.Add(formParameter.Name, schema);
                    
                    // Thêm vào danh sách required nếu là trường bắt buộc
                    if (formParameter.IsRequired)
                    {
                        formBodyContent.Schema.Required.Add(formParameter.Name);
                    }

                    // Thêm mô tả nếu có
                    if (!string.IsNullOrEmpty(formParameter.ModelMetadata?.Description))
                    {
                        schema.Description = formParameter.ModelMetadata.Description;
                    }
                }
            }
        }
    }
} 