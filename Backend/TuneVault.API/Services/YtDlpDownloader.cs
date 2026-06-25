using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Hosting;
using TuneVault.Domain;
using TuneVault.Infrastructure;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace TuneVault.API.Services;

public class YtDlpDownloader : IYtDlpDownloader
{
    private readonly string _storagePath;

    public YtDlpDownloader(IConfiguration config, IWebHostEnvironment env)
    {
        _storagePath = Path.GetFullPath(config["Storage:MediaPath"] ?? Path.Combine(env.ContentRootPath, "storage", "media"));
        Directory.CreateDirectory(_storagePath); // Đảm bảo thư mục tồn tại

        // Kiểm tra sự tồn tại của yt-dlp và ffmpeg khi khởi tạo service
        try
        {
            using var process = Process.Start(new ProcessStartInfo("yt-dlp", "--version") { RedirectStandardOutput = true, UseShellExecute = false, CreateNoWindow = true });
            process?.WaitForExit();
            if (process?.ExitCode != 0) throw new InvalidOperationException("yt-dlp not found or not working.");
            using var ffmpegProcess = Process.Start(new ProcessStartInfo("ffmpeg", "-version") { RedirectStandardOutput = true, UseShellExecute = false, CreateNoWindow = true });
            ffmpegProcess?.WaitForExit();
            if (ffmpegProcess?.ExitCode != 0) throw new InvalidOperationException("FFmpeg not found or not working.");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"!!! Cảnh báo: yt-dlp hoặc FFmpeg không được tìm thấy hoặc không hoạt động. Lỗi: {ex.Message}");
            Console.Error.WriteLine("!!! Vui lòng đảm bảo yt-dlp và FFmpeg đã được cài đặt và có trong biến môi trường PATH.");
        }
    }

    public async Task<(string fileName, string title, string uploader, string thumbnailUrl, int durationSeconds)> DownloadAudioAsync(string youtubeUrl, string mediaId, CancellationToken cancellationToken)
    {
        // Loại bỏ các tham số playlist để đảm bảo chỉ tải 1 video duy nhất
        var uriBuilder = new UriBuilder(youtubeUrl);
        var query = System.Web.HttpUtility.ParseQueryString(uriBuilder.Query);
        query.Remove("list");
        query.Remove("start_radio");
        uriBuilder.Query = query.ToString();
        youtubeUrl = uriBuilder.ToString();

        youtubeUrl = youtubeUrl.Trim();

        // Tên file sẽ được lưu là {mediaId}.mp3
        var outputFileName = $"{mediaId}.mp3";
        var outputFilePath = Path.Combine(_storagePath, outputFileName);

        // Lấy thông tin video trước để có title và thumbnail
        var infoProcessStartInfo = new ProcessStartInfo("yt-dlp")
        {
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        };
        infoProcessStartInfo.ArgumentList.Add("--dump-json");
        infoProcessStartInfo.ArgumentList.Add("--no-playlist");
        infoProcessStartInfo.ArgumentList.Add("--restrict-filenames");
        infoProcessStartInfo.ArgumentList.Add(youtubeUrl);

        string videoTitle = "Unknown Title";
        string videoUploader = "Unknown Artist";
        string? thumbnailUrl = null;
        int durationSeconds = 0;

        try 
        {
            using var infoProcess = Process.Start(infoProcessStartInfo);
            if (infoProcess == null) throw new InvalidOperationException("Failed to start yt-dlp info process.");

            var infoOutput = new System.Text.StringBuilder();
            var infoError = new System.Text.StringBuilder();
            infoProcess.OutputDataReceived += (sender, args) => { if (args.Data != null) infoOutput.AppendLine(args.Data); };
            infoProcess.ErrorDataReceived += (sender, args) => { if (args.Data != null) infoError.AppendLine(args.Data); };
            infoProcess.BeginOutputReadLine();
            infoProcess.BeginErrorReadLine();

            await infoProcess.WaitForExitAsync(cancellationToken);

            // Tìm đúng dòng JSON trong mớ hỗn hợp Output (đề phòng có cảnh báo rác phía trước)
            var lines = infoOutput.ToString().Split('\n', StringSplitOptions.RemoveEmptyEntries);
            foreach (var line in lines)
            {
                if (!line.Trim().StartsWith("{")) continue;
                try
                {
                    using var doc = JsonDocument.Parse(line);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("title", out var t)) videoTitle = t.GetString() ?? videoTitle;
                    if (root.TryGetProperty("uploader", out var u)) videoUploader = u.GetString() ?? videoUploader;
                    if (root.TryGetProperty("thumbnail", out var th)) thumbnailUrl = th.GetString();
                    if (root.TryGetProperty("duration", out var d))
                    {
                        if (d.ValueKind == JsonValueKind.Number) durationSeconds = (int)d.GetDouble();
                    }
                    break; // Đã tìm thấy dòng JSON chính xác
                }
                catch { /* Bỏ qua các dòng không phải JSON hợp lệ */ }
            }

            if (infoProcess.ExitCode != 0)
            {
                Console.WriteLine($">>> Lỗi lấy thông tin: {infoError}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($">>> Bỏ qua lỗi lấy metadata, tiến hành tải trực tiếp: {ex.Message}");
        }

        // Tải audio
        var downloadProcessStartInfo = new ProcessStartInfo("yt-dlp")
        {
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true
        };
        downloadProcessStartInfo.ArgumentList.Add("-x");
        downloadProcessStartInfo.ArgumentList.Add("--audio-format");
        downloadProcessStartInfo.ArgumentList.Add("mp3");
        downloadProcessStartInfo.ArgumentList.Add("--no-playlist");
        downloadProcessStartInfo.ArgumentList.Add("--audio-quality");
        downloadProcessStartInfo.ArgumentList.Add("0");
        downloadProcessStartInfo.ArgumentList.Add("-o");
        downloadProcessStartInfo.ArgumentList.Add(outputFilePath);
        downloadProcessStartInfo.ArgumentList.Add(youtubeUrl);

        using (var downloadProcess = Process.Start(downloadProcessStartInfo))
        {
            if (downloadProcess == null) throw new InvalidOperationException("Failed to start yt-dlp download process.");
            
            var stdOutput = new System.Text.StringBuilder();
            var stdError = new System.Text.StringBuilder();
            downloadProcess.OutputDataReceived += (sender, args) => { if (args.Data != null) stdOutput.AppendLine(args.Data); };
            downloadProcess.ErrorDataReceived += (sender, args) => { if (args.Data != null) stdError.AppendLine(args.Data); };
            downloadProcess.BeginOutputReadLine();
            downloadProcess.BeginErrorReadLine();

            await downloadProcess.WaitForExitAsync(cancellationToken);

            Console.WriteLine($">>> yt-dlp Download Standard Output:\n{stdOutput.ToString()}");
            Console.WriteLine($">>> yt-dlp Download Standard Error:\n{stdError.ToString()}");

            if (downloadProcess.ExitCode != 0)
            {
                throw new InvalidOperationException($"Failed to download audio: {stdError.ToString()}");
            }
        }

        // Kiểm tra xem file thực sự tồn tại và có dữ liệu không
        if (!File.Exists(outputFilePath))
        {
            throw new FileNotFoundException("Quá trình tải kết thúc nhưng không tìm thấy file nhạc trên ổ đĩa.", outputFilePath);
        }

        var fileInfo = new FileInfo(outputFilePath);
        if (fileInfo.Length == 0)
        {
            try { File.Delete(outputFilePath); } catch { } // Dọn dẹp file lỗi nếu cần
            throw new InvalidOperationException("File nhạc tải về bị lỗi (0 bytes).");
        }

        return (outputFileName, videoTitle, videoUploader, thumbnailUrl ?? "", durationSeconds);
    }
}