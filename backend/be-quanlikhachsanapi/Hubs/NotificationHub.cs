using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace be_quanlikhachsanapi.Hubs
{
    public class NotificationHub : Hub
    {
        // Phương thức kết nối
        public override async Task OnConnectedAsync()
        {
            // Ghi log khi có client kết nối
            Console.WriteLine($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        // Phương thức ngắt kết nối
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // Ghi log khi client ngắt kết nối
            Console.WriteLine($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        // Tham gia vào nhóm theo vai trò
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"Client {Context.ConnectionId} joined group {groupName}");
        }

        // Rời khỏi nhóm
        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"Client {Context.ConnectionId} left group {groupName}");
        }
    }
}