using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TuneVault.Application.Artists;
using TuneVault.Application.Media;
using TuneVault.Application.Common;
using TuneVault.Application.Playlists;
using TuneVault.Application.Users;
using TuneVault.Application.YouTube;
using TuneVault.Infrastructure;
using TuneVault.API.Filters;
using TuneVault.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Bật logging thông tin nhạy cảm (PII) CHỈ trong môi trường Development.
// Điều này cực kỳ hữu ích để debug các lỗi JWT như IDX10517, vì nó sẽ hiển thị chi tiết token và key.
if (builder.Environment.IsDevelopment())
{
    Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173", "http://localhost:5132")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ExceptionHandlingFilter>();
});

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"];
var secretKeyPreview = secretKey == null ? "null" : secretKey.Length.ToString();
Console.WriteLine($"JWT SecretKey loaded. Length={secretKeyPreview}");
if (string.IsNullOrWhiteSpace(secretKey))
{
    throw new InvalidOperationException("JWT:SecretKey is missing/empty in appsettings.json");
}
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];
Console.WriteLine($"JWT Issuer={issuer ?? "null"} Audience={audience ?? "null"}");
var key = Encoding.ASCII.GetBytes(secretKey);

// Gán một KeyId tường minh để giải quyết lỗi IDX10517
// Điều này giúp trình xác thực JWT khớp chính xác token với key trên server.
var signingKey = new SymmetricSecurityKey(key) { KeyId = "TuneVault-Key-2024" };


builder.Services.AddSingleton<ITokenService>(sp =>
{
    // Đảm bảo JwtTokenService sử dụng chính xác instance `signingKey` đã được tạo
    return new JwtTokenService(sp.GetRequiredService<IConfiguration>(), signingKey);
});
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKeys = new[] { signingKey }, // Sử dụng IssuerSigningKeys (số nhiều)
        ValidateIssuer = false,
        ValidateAudience = false,
        // Debug: log secret key length to confirm runtime config
        // (Signing will still require correct secret)

        // Token validation must use exactly the same symmetric key used to sign
        // If token was signed with a different secret, validation will fail with IDX10517.

        // Bảo đảm validate chữ ký bằng đúng Symmetric key từ SecretKey

// NameClaimType chưa import ClaimTypes nên tạm bỏ để tránh lỗi build
        // NameClaimType = ClaimTypes.NameIdentifier,
        RoleClaimType = "role",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            // Sử dụng ILogger để ghi lại lỗi đầy đủ, bao gồm cả stack trace
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(context.Exception, "Lỗi xác thực JWT: Authentication Failed.");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            // Ghi lại lý do Challenge được kích hoạt (ví dụ: token không có, token hết hạn)
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("Thử thách JWT: {Error} - {ErrorDescription}", context.Error, context.ErrorDescription);

            // Ghi lại lỗi chi tiết hơn nếu có
            if (context.AuthenticateFailure != null)
                logger.LogError(context.AuthenticateFailure, "Lỗi xác thực chi tiết dẫn đến Challenge.");
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            // Cho phép lấy Token từ Query String cho SignalR và các tệp Media Stream
            if (!string.IsNullOrEmpty(accessToken) &&
                (path.StartsWithSegments("/notificationHub") || path.StartsWithSegments("/api/media/stream")))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Register Services
builder.Services.AddScoped<INotificationService, SignalRNotificationService>(); // Sử dụng INotificationService từ Application
builder.Services.AddSingleton<IEmailShareService>(sp => new EmailShareService(sp.GetRequiredService<IConfiguration>())); // Sử dụng IEmailShareService từ Application
builder.Services.AddHttpClient<IAnthropicService, AnthropicService>();

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(
    typeof(RegisterUser).Assembly,
    typeof(GetSongsQuery).Assembly,
    typeof(CreatePlaylistCommand).Assembly,
    typeof(GetArtistsQuery).Assembly
).AddOpenBehavior(typeof(ValidationBehavior<,>)));

var validators = AssemblyScanner.FindValidatorsInAssembly(typeof(RegisterUser).Assembly);
foreach (var validator in validators)
{
    builder.Services.AddTransient(validator.InterfaceType, validator.ValidatorType);
}

// Cài đặt BCrypt.Net-Next nếu chưa có
// Chạy lệnh này trong Package Manager Console của project TuneVault.Infrastructure:
// Install-Package BCrypt.Net-Next
// Hoặc trong terminal của project TuneVault.Infrastructure: dotnet add package BCrypt.Net-Next

// Background services
builder.Services.AddSingleton<TuneVault.API.Services.IBackgroundTaskQueue, TuneVault.API.Services.BackgroundTaskQueue>();
builder.Services.AddHostedService<TuneVault.API.Services.QueuedHostedService>();
builder.Services.AddSingleton<TuneVault.API.Services.IYtDlpDownloader, TuneVault.API.Services.YtDlpDownloader>();
builder.Services.AddSingleton<TuneVault.API.Services.ImportJobStore>();

builder.Services.AddHttpContextAccessor(); // Thêm dòng này
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "TuneVault API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Nhập token JWT vào đây. Hệ thống sẽ tự thêm tiền tố 'Bearer '.",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddSignalR();
builder.Services.AddInfrastructureServices(builder.Configuration);
// SỬA LỖI: Đăng ký IDbContextFactory để ShareMediaHandler có thể sử dụng.
// Lỗi "Unable to resolve service" xảy ra vì dịch vụ này chưa được đăng ký.
// SỬA LỖI: Đăng ký factory với vòng đời Scoped để khớp với DbContext, tránh lỗi "Cannot consume scoped service from singleton".
builder.Services.AddDbContextFactory<TuneVault.Infrastructure.TuneVaultDbContext>(lifetime: ServiceLifetime.Scoped);

var app = builder.Build();

// During development, ensure the database is created to avoid schema issues when running locally.
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<TuneVault.Infrastructure.TuneVaultDbContext>();
        db.Database.EnsureCreated();
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Warning: failed to ensure database created: {ex.Message}");
}

// Cấu hình để phục vụ các file tĩnh từ thư mục mediaStoragePath
var storagePath = Path.Combine(builder.Environment.ContentRootPath, "storage", "media");
storagePath = Path.GetFullPath(storagePath); // Đảm bảo đường dẫn tuyệt đối
if (!Directory.Exists(storagePath)) Directory.CreateDirectory(storagePath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(storagePath),
    RequestPath = "/media" // Đường dẫn mà Frontend sẽ dùng để truy cập file (ví dụ: /media/abc.mp3)
});

var profileStoragePath = Path.Combine(builder.Environment.ContentRootPath, "storage", "profile");
profileStoragePath = Path.GetFullPath(profileStoragePath);
if (!Directory.Exists(profileStoragePath)) Directory.CreateDirectory(profileStoragePath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(profileStoragePath),
    RequestPath = "/media/profile"
});

app.UseRouting();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TuneVault.API.Hubs.NotificationHub>("/notificationHub");
app.Run();