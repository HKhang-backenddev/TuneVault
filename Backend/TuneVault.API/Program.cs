using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using TuneVault.Application.Artists;
using TuneVault.Application.Media;
using TuneVault.Application.Playlists;
using TuneVault.Application.Users;
using TuneVault.Application.YouTube;
using TuneVault.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"] ?? "your-secret-key-min-32-characters-long";
var key = Encoding.ASCII.GetBytes(secretKey);

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
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Register Services
builder.Services.AddSingleton<ITokenService, JwtTokenService>();

// Validators
builder.Services.AddTransient<IValidator<RegisterUser>, RegisterUserValidator>();
builder.Services.AddTransient<IValidator<LoginUser>, LoginUserValidator>();

// MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(
    typeof(RegisterUser).Assembly,
    typeof(GetSongsQuery).Assembly,
    typeof(CreatePlaylistCommand).Assembly,
    typeof(GetArtistsQuery).Assembly
));

// Background services
builder.Services.AddSingleton<TuneVault.API.Services.IBackgroundTaskQueue, TuneVault.API.Services.BackgroundTaskQueue>();
builder.Services.AddHostedService<TuneVault.API.Services.QueuedHostedService>();
builder.Services.AddSingleton<TuneVault.API.Services.IYtDlpDownloader, TuneVault.API.Services.YtDlpDownloader>();
builder.Services.AddSingleton<TuneVault.API.Services.ImportJobStore>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddInfrastructureServices(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Serve downloaded media files from storage/media at /media
var storagePath = Path.Combine(builder.Environment.ContentRootPath, "storage", "media");
storagePath = Path.GetFullPath(storagePath);
if (!Directory.Exists(storagePath)) Directory.CreateDirectory(storagePath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(storagePath),
    RequestPath = "/media"
});
app.Run();