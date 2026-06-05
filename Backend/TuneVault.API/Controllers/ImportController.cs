using Microsoft.AspNetCore.Mvc;
using TuneVault.API.Services;
using TuneVault.Infrastructure;
using TuneVault.Domain;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportController : ControllerBase
{
    private readonly IBackgroundTaskQueue _queue;
    private readonly IYtDlpDownloader _downloader;
    private readonly TuneVaultDbContext _db;
    private readonly ImportJobStore _jobStore;

    public ImportController(IBackgroundTaskQueue queue, IYtDlpDownloader downloader, TuneVaultDbContext db, ImportJobStore jobStore)
    {
        _queue = queue;
        _downloader = downloader;
        _db = db;
        _jobStore = jobStore;
    }

    public record ImportRequest(string Url);

    [HttpPost("import")]
    public IActionResult Import([FromBody] ImportRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Url)) return BadRequest("Url is required");

        var jobId = Guid.NewGuid().ToString("N");

        _jobStore.Set(jobId, new ImportJobStatus(ImportJobState.Queued));

        _queue.QueueBackgroundWorkItem(async token =>
        {
            _jobStore.Set(jobId, new ImportJobStatus(ImportJobState.InProgress));
            try
            {
                var file = await _downloader.DownloadAudioAsync(req.Url, jobId, token);

                var media = new MediaItem
                {
                    Id = Guid.NewGuid(),
                    Title = Path.GetFileNameWithoutExtension(file),
                    FilePath = Path.GetFileName(file),
                    CreatedAt = DateTime.UtcNow,
                };

                _db.MediaItems.Add(media);
                await _db.SaveChangesAsync(token);

                _jobStore.Set(jobId, new ImportJobStatus(ImportJobState.Completed, Message: null, MediaId: media.Id));
            }
            catch (Exception ex)
            {
                _jobStore.Set(jobId, new ImportJobStatus(ImportJobState.Failed, ex.Message));
            }
        });

        return Accepted(new { jobId });
    }

    [HttpGet("status/{jobId}")]
    public IActionResult Status(string jobId)
    {
        var s = _jobStore.Get(jobId);
        if (s == null) return NotFound();
        return Ok(s);
    }
}
