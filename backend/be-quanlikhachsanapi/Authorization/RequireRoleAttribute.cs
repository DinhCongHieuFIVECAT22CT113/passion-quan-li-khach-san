using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;
using System.Security.Claims;

namespace be_quanlikhachsanapi.Authorization;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public class RequireRoleAttribute : AuthorizeAttribute, IAuthorizationFilter
{
    private readonly string[] _requiredRoles;

    public RequireRoleAttribute(params string[] roles)
    {
        _requiredRoles = roles;
        // Gán giá trị cho property Roles của AuthorizeAttribute 
        // để ASP.NET Core có thể sử dụng nó cho các cơ chế authorization mặc định nếu cần.
        Roles = string.Join(",", roles);
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        // Nếu người dùng chưa được xác thực, middleware `UseAuthentication` sẽ xử lý
        // và trả về 401 Unauthorized. Tuy nhiên, kiểm tra ở đây để chắc chắn.
        if (user?.Identity?.IsAuthenticated != true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // Lấy claim "role" từ token. Đảm bảo tên claim này ("role")
        // khớp với tên claim bạn đã đặt khi tạo token (ví dụ: ClaimTypes.Role).
        var userRoles = user.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value);

        if (_requiredRoles == null || _requiredRoles.Length == 0)
        {
            // Nếu không có role nào được yêu cầu cụ thể, chỉ cần xác thực là đủ.
            return;
        }

        // Kiểm tra xem người dùng có bất kỳ role nào trong danh sách _requiredRoles không.
        var hasRequiredRole = userRoles.Any(userRole => _requiredRoles.Contains(userRole));

        if (!hasRequiredRole)
        {
            // Người dùng không có quyền truy cập
            context.Result = new ForbidResult(); // Trả về 403 Forbidden
        }
        // Nếu có quyền, không làm gì cả, request sẽ được tiếp tục xử lý.
    }
} 