using System.Threading;
using System.Threading.Tasks;

namespace TuneVault.API.Services;

public interface IBackgroundTaskQueue
{
    void QueueBackgroundWorkItem(Func<CancellationToken, Task> workItem);
    Task<Func<CancellationToken, Task>?> DequeueAsync(CancellationToken cancellationToken);
}
