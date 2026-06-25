using System.Threading;
using System.Threading.Tasks;

namespace TuneVault.Application.Users;

public interface INotificationService
{
    Task SendNotificationAsync(string userId, string message, string type = "info", CancellationToken ct = default);
}