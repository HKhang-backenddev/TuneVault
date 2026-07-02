-- =============================================
-- TuneVault: Thêm các bảng tính năng mới
-- Chạy script này trong SSMS hoặc Azure Data Studio
-- =============================================

-- 1. Xóa database cũ nếu muốn tạo mới
-- DROP DATABASE TuneVault;
-- CREATE DATABASE TuneVault;

-- 2. Thêm bảng PlaylistFollowers
CREATE TABLE [PlaylistFollowers] (
    [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [PlaylistId] UNIQUEIDENTIFIER NOT NULL,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [FollowedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_PlaylistFollowers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PlaylistFollowers_Playlists] FOREIGN KEY ([PlaylistId]) REFERENCES [Playlists]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PlaylistFollowers_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
);

-- Tạo index unique cho tránh trùng lặp
CREATE UNIQUE INDEX [IX_PlaylistFollowers_PlaylistId_UserId] ON [PlaylistFollowers] ([PlaylistId], [UserId]);

-- 3. Thêm bảng PlaylistCollaborators
CREATE TABLE [PlaylistCollaborators] (
    [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [PlaylistId] UNIQUEIDENTIFIER NOT NULL,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [AddedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_PlaylistCollaborators] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_PlaylistCollaborators_Playlists] FOREIGN KEY ([PlaylistId]) REFERENCES [Playlists]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PlaylistCollaborators_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
);

-- Tạo index unique cho tránh trùng lặp
CREATE UNIQUE INDEX [IX_PlaylistCollaborators_PlaylistId_UserId] ON [PlaylistCollaborators] ([PlaylistId], [UserId]);

-- 4. Thêm bảng MediaComments
CREATE TABLE [MediaComments] (
    [Id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [MediaItemId] UNIQUEIDENTIFIER NOT NULL,
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [Content] NVARCHAR(MAX) NOT NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [PK_MediaComments] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_MediaComments_MediaItems] FOREIGN KEY ([MediaItemId]) REFERENCES [MediaItems]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_MediaComments_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
);

-- Tạo index để查询 nhanh hơn
CREATE INDEX [IX_MediaComments_MediaItemId] ON [MediaComments] ([MediaItemId]);
CREATE INDEX [IX_MediaComments_UserId] ON [MediaComments] ([UserId]);

-- 5. Thêm cột vào bảng PlayHistories
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PlayHistories') AND name = 'PlayDurationSeconds')
BEGIN
    ALTER TABLE [PlayHistories] ADD [PlayDurationSeconds] INT NOT NULL DEFAULT 0;
END

-- 6. Thêm cột vào bảng Playlists
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Playlists') AND name = 'IsCollaborative')
BEGIN
    ALTER TABLE [Playlists] ADD [IsCollaborative] BIT NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Playlists') AND name = 'UpdatedAt')
BEGIN
    ALTER TABLE [Playlists] ADD [UpdatedAt] DATETIME2 NULL;
END

PRINT 'Done! Các bảng và cột mới đã được tạo thành công.';
