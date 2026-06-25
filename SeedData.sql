DECLARE @AdminUserId UNIQUEIDENTIFIER = '3872327a-4302-4e5c-a58a-ca48edd2b108';
IF NOT EXISTS (SELECT 1 FROM Users WHERE Id = @AdminUserId OR Username = 'admin')
BEGIN
    INSERT INTO Users (Id, Username, Email, PasswordHash, DisplayName, Bio, Location, CreatedAt, AvatarUrl, BannerUrl, WebsiteUrl, TwitterUrl, GithubUrl, LastUpdatedAt)
    VALUES (
        @AdminUserId, 
        'admin', 
        'admin@tunevault.com', 
        '$2a$11$R9h/lIPzHZluvTCmmeviN.8P9Pk/KjyWnyCf2U69Uc9V9iy9S/The', -- Mật khẩu đã được hash
        'TuneVault Admin', 
        'Chào mừng bạn đến với TuneVault! Tôi là người đam mê âm nhạc và công nghệ.', 
        'Hà Nội, Việt Nam', 
        GETUTCDATE(),
        'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070',
        'https://tunevault.com',
        'https://twitter.com/tunevault',
        'https://github.com/tunevault',
        GETUTCDATE()
    );
END

-- Tạo một nghệ sĩ mẫu nếu chưa tồn tại
DECLARE @ArtistId UNIQUEIDENTIFIER = '6a37b7b4-757a-436a-b3d9-72fad1565a00';
IF NOT EXISTS (SELECT 1 FROM Artists WHERE Id = @ArtistId OR Name = 'V-Pop Legends')
BEGIN
    INSERT INTO Artists (Id, Name, Bio, ImageUrl, CreatedAt)
    VALUES (@ArtistId, 'V-Pop Legends', 'Vietnamese singer-songwriter', 'https://bit.ly/sontung-img', GETUTCDATE());
END

-- Thêm Bài hát mẫu
-- Câu lệnh này sẽ thêm 10 bài hát nếu chưa có bài nào được thêm cho admin và nghệ sĩ này.
IF NOT EXISTS (SELECT 1 FROM MediaItems WHERE OwnerId = @AdminUserId AND ArtistId = @ArtistId)
BEGIN
    INSERT INTO MediaItems (Id, Title, ArtistId, Genre, FilePath, DurationInSeconds, ThumbnailUrl, OwnerId, CreatedAt, Type)
    VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Sample Track 1', @ArtistId, 'Indie', 'sample_1.mp3', 180, 'https://picsum.photos/seed/track1/300/300', @AdminUserId, GETUTCDATE(), 0),
    ('00000000-0000-0000-0000-000000000002', 'Sample Track 2', @ArtistId, 'Pop', 'sample_2.mp3', 180, 'https://picsum.photos/seed/track2/300/300', @AdminUserId, GETUTCDATE(), 0),
    ('00000000-0000-0000-0000-000000000003', 'Sample Track 3', @ArtistId, 'Indie', 'sample_3.mp3', 180, 'https://picsum.photos/seed/track3/300/300', @AdminUserId, GETUTCDATE(), 0),
    ('00000000-0000-0000-0000-000000000004', 'Sample Track 4', @ArtistId, 'Pop', 'sample_4.mp3', 180, 'https://picsum.photos/seed/track4/300/300', @AdminUserId, GETUTCDATE(), 0),
    ('00000000-0000-0000-0000-000000000005', 'Sample Track 5', @ArtistId, 'Indie', 'sample_5.mp3', 180, 'https://picsum.photos/seed/track5/300/300', @AdminUserId, GETUTCDATE(), 0),
    ('00000000-0000-0000-0000-000000000006', 'Sample Track 6', @ArtistId, 'Pop', 'sample_6.mp3', 180, 'https://picsum.photos/seed/track6/300/300', @AdminUserId, GETUTCDATE(), 0),
    ('00000000-0000-0000-0000-000000000007', 'Sample Track 7', @ArtistId, 'Indie', 'sample_7.mp3', 180, 'https://picsum.photos/seed/track7/300/300', @AdminUserId, GETUTCDATE(), 0),
    ('00000000-0000-0000-0000-000000000008', 'Sample Track 8', @ArtistId, 'Pop', 'sample_8.mp3', 180, 'https://picsum.photos/seed/track8/300/300', @AdminUserId, GETUTCDATE(), 0),
    ('00000000-0000-0000-0000-000000000009', 'Sample Track 9', @ArtistId, 'Indie', 'sample_9.mp3', 180, 'https://picsum.photos/seed/track9/300/300', @AdminUserId, GETUTCDATE(), 0),
    ('00000000-0000-0000-0000-000000000010', 'Sample Track 10', @ArtistId, 'Pop', 'sample_10.mp3', 180, 'https://picsum.photos/seed/track10/300/300', @AdminUserId, GETUTCDATE(), 0);
END
GO