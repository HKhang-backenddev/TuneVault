using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TuneVault.API.Hubs
{
    // Thêm [Authorize] để đảm bảo chỉ những người dùng đã đăng nhập
    // mới có thể kết nối vào Hub này.
    [Authorize]
    public class NotificationHub : Hub
    {
        // Trong tương lai, bạn có thể định nghĩa các phương thức ở đây để client gọi lên server.
    }
}