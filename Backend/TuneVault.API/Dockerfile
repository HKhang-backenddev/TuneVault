FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Backend/TuneVault.API/TuneVault.API.csproj", "TuneVault.API/"]
RUN dotnet restore "TuneVault.API/TuneVault.API.csproj"
COPY . .
WORKDIR "/src/TuneVault.API"
RUN dotnet build "TuneVault.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TuneVault.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY ["Backend/TuneVault.API/storage", "storage/media"]

# Create storage directory
RUN mkdir -p storage/media

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "TuneVault.API.dll"]
