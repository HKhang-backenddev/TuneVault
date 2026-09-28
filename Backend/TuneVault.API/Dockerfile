# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["Backend/TuneVault.sln", "./"]
COPY ["Backend/TuneVault.API/TuneVault.API.csproj", "TuneVault.API/"]
COPY ["Backend/TuneVault.Application/TuneVault.Application.csproj", "TuneVault.Application/"]
COPY ["Backend/TuneVault.Domain/TuneVault.Domain.csproj", "TuneVault.Domain/"]
COPY ["Backend/TuneVault.Infrastructure/TuneVault.Infrastructure.csproj", "TuneVault.Infrastructure/"]

RUN dotnet restore "TuneVault.API/TuneVault.API.csproj"

# Copy source
COPY Backend/ .
WORKDIR "/src/TuneVault.API"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 10000

# Install yt-dlp for media download
RUN apt-get update && apt-get install -y python3 python3-pip && \
    pip3 install yt-dlp && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TuneVault.API.dll"]