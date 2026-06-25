using System.Threading;
using System.Threading.Tasks;

namespace TuneVault.API.Services;

public interface IYtDlpDownloader
{
    Task<(string fileName, string title, string uploader, string thumbnailUrl, int durationSeconds)> DownloadAudioAsync(string youtubeUrl, string mediaId, CancellationToken cancellationToken);
}