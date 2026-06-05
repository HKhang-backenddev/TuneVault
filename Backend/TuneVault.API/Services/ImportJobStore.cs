using System.Collections.Concurrent;

namespace TuneVault.API.Services;

public enum ImportJobState { Queued, InProgress, Completed, Failed }

public record ImportJobStatus(ImportJobState State, string? Message = null, Guid? MediaId = null);

public class ImportJobStore
{
    private readonly ConcurrentDictionary<string, ImportJobStatus> _store = new();

    public void Set(string jobId, ImportJobStatus status) => _store[jobId] = status;

    public ImportJobStatus? Get(string jobId) => _store.TryGetValue(jobId, out var s) ? s : null;
}
