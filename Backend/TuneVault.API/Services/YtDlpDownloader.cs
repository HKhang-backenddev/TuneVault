using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace TuneVault.API.Services;

public interface IYtDlpDownloader
{
    Task<string> DownloadAudioAsync(string url, string id, CancellationToken cancellationToken);
}

public class YtDlpDownloader : IYtDlpDownloader
{
    private readonly string _outputDir;

    public YtDlpDownloader(IConfiguration config, IWebHostEnvironment env)
    {
        _outputDir = config["Storage:MediaPath"] ?? Path.Combine(env.ContentRootPath, "storage", "media");
        Directory.CreateDirectory(_outputDir);
    }

    public async Task<string> DownloadAudioAsync(string url, string id, CancellationToken cancellationToken)
    {
        var outputTemplate = Path.Combine(_outputDir, id + ".%(ext)s");

        var psi = new ProcessStartInfo
        {
            FileName = "yt-dlp",
            Arguments = $"-x --audio-format mp3 -o \"{outputTemplate}\" --no-playlist \"{url}\"",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        using var proc = Process.Start(psi)!;
        if (proc == null) throw new InvalidOperationException("Failed to start yt-dlp process");

        await proc.WaitForExitAsync(cancellationToken);

        if (proc.ExitCode != 0)
        {
            var err = await proc.StandardError.ReadToEndAsync();
            throw new InvalidOperationException("yt-dlp failed: " + err);
        }

        // find file
        var files = Directory.GetFiles(_outputDir, id + ".*");
        var file = files.FirstOrDefault();
        if (file == null) throw new FileNotFoundException("Downloaded file not found");
        // return full path
        return file;
    }
}
