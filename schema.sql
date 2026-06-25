-- Bảng này lưu trữ thông tin người dùng.
-- Tương ứng với AspNetUsers / UserProfile trong yêu cầu.
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Username NVARCHAR(256) NOT NULL UNIQUE,
    Email NVARCHAR(256) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    DisplayName NVARCHAR(256),
    Bio NVARCHAR(MAX),
    AvatarUrl NVARCHAR(MAX),
    BannerUrl NVARCHAR(MAX),
    Location NVARCHAR(256),
    WebsiteUrl NVARCHAR(MAX),
    TwitterUrl NVARCHAR(MAX),
    GithubUrl NVARCHAR(MAX),
    Gender NVARCHAR(50),
    DateOfBirth DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    LastUpdatedAt DATETIME2
);

-- Bảng nghệ sĩ
CREATE TABLE Artists (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Name NVARCHAR(256) NOT NULL,
    Bio NVARCHAR(MAX),
    ImageUrl NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Bảng album
CREATE TABLE Albums (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Title NVARCHAR(256) NOT NULL,
    ArtistId UNIQUEIDENTIFIER,
    CoverUrl NVARCHAR(MAX),
    ReleaseDate DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (ArtistId) REFERENCES Artists(Id)
);

-- Bảng chính cho các mục media (nhạc/video)
-- Đáp ứng yêu cầu về MediaItem.
CREATE TABLE MediaItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Title NVARCHAR(MAX) NOT NULL,
    ArtistId UNIQUEIDENTIFIER,
    AlbumId UNIQUEIDENTIFIER,
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    FilePath NVARCHAR(MAX) NOT NULL,
    ThumbnailUrl NVARCHAR(MAX),
    Genre NVARCHAR(100),
    DurationInSeconds INT,
    Type INT NOT NULL, -- 0: Audio, 1: Video
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (ArtistId) REFERENCES Artists(Id),
    FOREIGN KEY (AlbumId) REFERENCES Albums(Id) ON DELETE SET NULL,
    FOREIGN KEY (OwnerId) REFERENCES Users(Id) ON DELETE NO ACTION -- Giữ lại media dù người dùng bị xóa
);

-- Bảng Playlist
CREATE TABLE Playlists (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(256) NOT NULL,
    Description NVARCHAR(MAX),
    CoverUrl NVARCHAR(MAX),
    IsPublic BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (OwnerId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Bảng liên kết giữa Playlist và MediaItem (PlaylistTrack)
CREATE TABLE PlaylistTracks (
    PlaylistId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (PlaylistId, MediaItemId),
    FOREIGN KEY (PlaylistId) REFERENCES Playlists(Id) ON DELETE CASCADE,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE
);

-- Bảng theo dõi (Follow)
CREATE TABLE Follows (
    FollowerId UNIQUEIDENTIFIER NOT NULL,
    TargetUserId UNIQUEIDENTIFIER NOT NULL,
    FollowedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (FollowerId, TargetUserId),
    FOREIGN KEY (FollowerId) REFERENCES Users(Id) ON DELETE NO ACTION,
    FOREIGN KEY (TargetUserId) REFERENCES Users(Id) ON DELETE NO ACTION
);

-- Bảng yêu thích (Favorite)
CREATE TABLE Favorites (
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    FavoritedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (UserId, MediaItemId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE
);

-- Bảng lịch sử nghe nhạc (PlayHistory)
CREATE TABLE PlayHistories (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    PlayedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE
);

-- Bảng thông báo (Notification)
CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- 'follow', 'share', 'download_success', 'error'
    Message NVARCHAR(MAX) NOT NULL,
    PayloadJson NVARCHAR(MAX), -- Lưu trữ dữ liệu bổ sung, ví dụ: mediaId
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Bảng chia sẻ media (MediaShare)
CREATE TABLE MediaShares (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    SenderId UNIQUEIDENTIFIER NOT NULL,
    ReceiverId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER,
    PlaylistId UNIQUEIDENTIFIER,
    SharedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (SenderId) REFERENCES Users(Id) ON DELETE NO ACTION,
    FOREIGN KEY (ReceiverId) REFERENCES Users(Id) ON DELETE NO ACTION,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id),
    FOREIGN KEY (PlaylistId) REFERENCES Playlists(Id)
);
