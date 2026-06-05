using Microsoft.Extensions.Hosting;
using System.Threading;
using System.Threading.Tasks;

namespace TuneVault.API.Services;

public class QueuedHostedService : BackgroundService
{
    private readonly IBackgroundTaskQueue _taskQueue;

    public QueuedHostedService(IBackgroundTaskQueue taskQueue)
    {
        _taskQueue = taskQueue;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var workItem = await _taskQueue.DequeueAsync(stoppingToken);
            if (workItem != null)
            {
                try
                {
                    await workItem(stoppingToken);
                }
                catch
                {
                    // swallow - real app should log
                }
            }
        }
    }
}
