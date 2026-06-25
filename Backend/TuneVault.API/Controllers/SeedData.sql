-- Thêm Nghệ sĩ mẫu
IF NOT EXISTS (SELECT 1 FROM Artists WHERE Name = 'Son Tung M-TP')
BEGIN
    INSERT INTO Artists (Id, Name, Bio, ImageUrl)
    VALUES (NEWID(), 'Son Tung M-TP', 'Vietnamese singer-songwriter', 'https://bit.ly/sontung-img');
END

DECLARE @ArtistId UNIQUEIDENTIFIER;
SELECT TOP 1 @ArtistId = Id FROM Artists WHERE Name = 'Son Tung M-TP';

IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
BEGIN
    INSERT INTO Users (Id, Username, Email, PasswordHash, DisplayName, Bio, Location, CreatedAt, AvatarUrl, BannerUrl, WebsiteUrl, TwitterUrl, GithubUrl)
    VALUES (
        NEWID(), 
        'admin', 
        'admin@tunevault.com', 
        '$2a$11$R9h/lIPzHZluvTCmmeviN.8P9Pk/KjyWnyCf2U69Uc9V9iy9S/The', 
        'TuneVault Admin', 
        'Chào mừng bạn đến với TuneVault! Tôi là người đam mê âm nhạc và công nghệ.', 
        'Hà Nội, Việt Nam', 
        GETUTCDATE(),
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070',
        'https://tunevault.com',
        'https://twitter.com/tunevault',
        'https://github.com/tunevault'
    );
END

DECLARE @OwnerId UNIQUEIDENTIFIER;
SELECT TOP 1 @OwnerId = Id FROM Users WHERE Username = 'admin';

-- Thêm Bài hát mẫu
IF NOT EXISTS (SELECT 1 FROM MediaItems WHERE OwnerId = @OwnerId AND ArtistId = @ArtistId)
BEGIN
    INSERT INTO MediaItems (Id, Title, [Type], DurationInSeconds, FilePath, ThumbnailUrl, Genre, OwnerId, ArtistId, CreatedAt)
    VALUES 
    (NEWID(), 'Chung Ta Cua Tuong Lai', 0, 240, 'chung-ta-cua-tuong-lai.mp3', 'https://i.ytimg.com/vi/0_XvSclx9Yc/mqdefault.jpg', 'V-Pop', @OwnerId, @ArtistId, GETUTCDATE()),
    (NEWID(), 'Lạc Trôi', 0, 232, 'lac-troi.mp3', 'https://i.ytimg.com/vi/Llw9Q6akRo4/mqdefault.jpg', 'V-Pop', @OwnerId, @ArtistId, GETUTCDATE()),
    (NEWID(), 'Hãy Trao Cho Anh', 0, 200, 'hay-trao-cho-anh.mp3', 'https://i.ytimg.com/vi/knW7-x7Y7RE/mqdefault.jpg', 'V-Pop', @OwnerId, @ArtistId, GETUTCDATE());
END
GO