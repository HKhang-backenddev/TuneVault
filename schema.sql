-- Bảng này lưu trữ thông tin người dùng.
-- =================================================================
-- TUNEVAULT DATABASE SCHEMA
-- This schema defines the core structure of the TuneVault application,
-- including users, media, playlists, and social interactions.
-- =================================================================

-- Bảng này lưu trữ thông tin người dùng, tương ứng với AspNetUsers.
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
-- Indexes for faster lookups
CREATE INDEX IX_Users_Username ON Users(Username);
CREATE INDEX IX_Users_Email ON Users(Email);


-- Bảng nghệ sĩ, có thể được liên kết với nhiều bài hát.
CREATE TABLE Artists (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Name NVARCHAR(256) NOT NULL,
    Bio NVARCHAR(MAX),
    ImageUrl NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
CREATE INDEX IX_Artists_Name ON Artists(Name);


-- Bảng album, chứa một tập hợp các bài hát của một nghệ sĩ.
CREATE TABLE Albums (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Title NVARCHAR(256) NOT NULL,
    ArtistId UNIQUEIDENTIFIER,
    CoverUrl NVARCHAR(MAX),
    ReleaseDate DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (ArtistId) REFERENCES Artists(Id) ON DELETE SET NULL -- Nếu nghệ sĩ bị xóa, album vẫn tồn tại
);
CREATE INDEX IX_Albums_ArtistId ON Albums(ArtistId);


-- Bảng chính cho các mục media (nhạc/video).
-- Đây là trung tâm của ứng dụng.
CREATE TABLE MediaItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    Title NVARCHAR(MAX) NOT NULL,
    ArtistId UNIQUEIDENTIFIER,
    AlbumId UNIQUEIDENTIFIER,
    OwnerId UNIQUEIDENTIFIER NOT NULL, -- Người dùng đã tải lên
    FilePath NVARCHAR(MAX) NOT NULL,
    ThumbnailUrl NVARCHAR(MAX),
    Genre NVARCHAR(100),
    DurationInSeconds INT,
    Type INT NOT NULL, -- 0: Audio, 1: Video
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (ArtistId) REFERENCES Artists(Id) ON DELETE SET NULL,
    FOREIGN KEY (AlbumId) REFERENCES Albums(Id) ON DELETE SET NULL,
    FOREIGN KEY (OwnerId) REFERENCES Users(Id) ON DELETE NO ACTION -- Giữ lại media dù người dùng bị xóa, cần xử lý logic ở app
);
CREATE INDEX IX_MediaItems_OwnerId ON MediaItems(OwnerId);
CREATE INDEX IX_MediaItems_ArtistId ON MediaItems(ArtistId);
CREATE INDEX IX_MediaItems_AlbumId ON MediaItems(AlbumId);


-- Bảng Playlist do người dùng tạo.
CREATE TABLE Playlists (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    OwnerId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(256) NOT NULL,
    Description NVARCHAR(MAX),
    CoverUrl NVARCHAR(MAX),
    IsPublic BIT NOT NULL DEFAULT 0, -- Cho phép playlist công khai hoặc riêng tư
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (OwnerId) REFERENCES Users(Id) ON DELETE CASCADE -- Nếu người dùng bị xóa, playlist của họ cũng bị xóa
);
CREATE INDEX IX_Playlists_OwnerId ON Playlists(OwnerId);


-- Bảng liên kết nhiều-nhiều giữa Playlist và MediaItem.
CREATE TABLE PlaylistTracks (
    PlaylistId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    TrackOrder INT NOT NULL DEFAULT 0, -- Thêm cột để sắp xếp thứ tự bài hát trong playlist
    PRIMARY KEY (PlaylistId, MediaItemId),
    FOREIGN KEY (PlaylistId) REFERENCES Playlists(Id) ON DELETE CASCADE, -- Nếu playlist bị xóa, các track trong đó cũng bị xóa
    FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE -- Nếu bài hát bị xóa, nó cũng bị xóa khỏi mọi playlist
);

-- Bảng theo dõi (Follow) giữa các người dùng.
CREATE TABLE Follows (
    FollowerId UNIQUEIDENTIFIER NOT NULL, -- Người đi theo dõi
    TargetUserId UNIQUEIDENTIFIER NOT NULL, -- Người được theo dõi
    FollowedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (FollowerId, TargetUserId),
    FOREIGN KEY (FollowerId) REFERENCES Users(Id) ON DELETE NO ACTION, -- Cần xử lý logic xóa user ở application layer
    FOREIGN KEY (TargetUserId) REFERENCES Users(Id) ON DELETE NO ACTION
);

-- Bảng yêu thích (Favorite/Like) bài hát của người dùng.
CREATE TABLE Favorites (
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    FavoritedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    PRIMARY KEY (UserId, MediaItemId),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE
);

-- Bảng lịch sử nghe nhạc của người dùng.
CREATE TABLE PlayHistories (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER NOT NULL,
    PlayedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE
);
CREATE INDEX IX_PlayHistories_UserId ON PlayHistories(UserId);


-- Bảng thông báo (Notification) cho người dùng.
CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL, -- Người nhận thông báo
    Type NVARCHAR(50) NOT NULL, -- 'follow', 'share', 'download_success', 'error'
    Message NVARCHAR(MAX) NOT NULL,
    PayloadJson NVARCHAR(MAX), -- Lưu trữ dữ liệu bổ sung, ví dụ: mediaId, senderId
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);
CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);


-- Bảng ghi lại hành động chia sẻ media.
CREATE TABLE MediaShares (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    SenderId UNIQUEIDENTIFIER NOT NULL,
    ReceiverId UNIQUEIDENTIFIER NOT NULL,
    MediaItemId UNIQUEIDENTIFIER,
    PlaylistId UNIQUEIDENTIFIER,
    SharedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (SenderId) REFERENCES Users(Id) ON DELETE NO ACTION, -- Giữ lại lịch sử chia sẻ dù người gửi bị xóa
    FOREIGN KEY (ReceiverId) REFERENCES Users(Id) ON DELETE CASCADE, -- Xóa record chia sẻ nếu người nhận bị xóa
    FOREIGN KEY (MediaItemId) REFERENCES MediaItems(Id) ON DELETE CASCADE, -- Xóa record nếu media được chia sẻ bị xóa
    FOREIGN KEY (PlaylistId) REFERENCES Playlists(Id) ON DELETE CASCADE -- Xóa record nếu playlist được chia sẻ bị xóa
);
CREATE INDEX IX_MediaShares_ReceiverId ON MediaShares(ReceiverId);
