﻿using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TuneVault.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Artists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Artists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AvatarUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Bio = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Albums",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ArtistId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoverImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReleaseDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Albums", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Albums_Artists_ArtistId",
                        column: x => x.ArtistId,
                        principalTable: "Artists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Follows",
                columns: table => new
                {
                    FollowerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FollowedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Follows", x => new { x.FollowerId, x.TargetUserId });
                    table.ForeignKey(
                        name: "FK_Follows_Users_FollowerId",
                        column: x => x.FollowerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Follows_Users_TargetUserId",
                        column: x => x.TargetUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PayloadJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Playlists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsPrivate = table.Column<bool>(type: "bit", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Playlists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Playlists_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MediaItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false),
                    DurationInSeconds = table.Column<int>(type: "int", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Genre = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ArtistId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AlbumId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MediaItems_Albums_AlbumId",
                        column: x => x.AlbumId,
                        principalTable: "Albums",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MediaItems_Artists_ArtistId",
                        column: x => x.ArtistId,
                        principalTable: "Artists",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MediaItems_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MediaItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LikedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorites", x => new { x.UserId, x.MediaItemId });
                    table.ForeignKey(
                        name: "FK_Favorites_MediaItems_MediaItemId",
                        column: x => x.MediaItemId,
                        principalTable: "MediaItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Favorites_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MediaShares",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReceiverId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MediaItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    PlaylistId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SharedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaShares", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MediaShares_MediaItems_MediaItemId",
                        column: x => x.MediaItemId,
                        principalTable: "MediaItems",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MediaShares_Playlists_PlaylistId",
                        column: x => x.PlaylistId,
                        principalTable: "Playlists",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MediaShares_Users_ReceiverId",
                        column: x => x.ReceiverId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MediaShares_Users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MediaItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlayedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayHistories_MediaItems_MediaItemId",
                        column: x => x.MediaItemId,
                        principalTable: "MediaItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlayHistories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlaylistTracks",
                columns: table => new
                {
                    PlaylistId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MediaItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaylistTracks", x => new { x.PlaylistId, x.MediaItemId });
                    table.ForeignKey(
                        name: "FK_PlaylistTracks_MediaItems_MediaItemId",
                        column: x => x.MediaItemId,
                        principalTable: "MediaItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlaylistTracks_Playlists_PlaylistId",
                        column: x => x.PlaylistId,
                        principalTable: "Playlists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Artists",
                columns: new[] { "Id", "Bio", "CreatedAt", "ImageUrl", "Name" },
                values: new object[] { new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), null, new DateTime(2026, 6, 5, 0, 0, 0, 0, DateTimeKind.Utc), null, "V-Pop Legends" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "AvatarUrl", "Bio", "CreatedAt", "DisplayName", "Email", "PasswordHash", "Username" },
                values: new object[] { new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, null, new DateTime(2026, 6, 5, 0, 0, 0, 0, DateTimeKind.Utc), "Administrator", "admin@tunevault.com", "$2a$11$mCUXAn3mSps0N8p9v9.7be0.U9.r0.C9Uj6N9Z6U1X7Z6U1X7Z6U1", "admin" });

            migrationBuilder.InsertData(
                table: "MediaItems",
                columns: new[] { "Id", "AlbumId", "ArtistId", "CreatedAt", "Description", "DurationInSeconds", "FilePath", "Genre", "OwnerId", "ThumbnailUrl", "Title", "Type" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 59, 0, 0, DateTimeKind.Utc), null, 180, "sample_1.mp3", "Indie", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 1", 0 },
                    { new Guid("00000000-0000-0000-0000-000000000002"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 58, 0, 0, DateTimeKind.Utc), null, 180, "sample_2.mp3", "Pop", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 2", 0 },
                    { new Guid("00000000-0000-0000-0000-000000000003"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 57, 0, 0, DateTimeKind.Utc), null, 180, "sample_3.mp3", "Indie", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 3", 0 },
                    { new Guid("00000000-0000-0000-0000-000000000004"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 56, 0, 0, DateTimeKind.Utc), null, 180, "sample_4.mp3", "Pop", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 4", 0 },
                    { new Guid("00000000-0000-0000-0000-000000000005"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 55, 0, 0, DateTimeKind.Utc), null, 180, "sample_5.mp3", "Indie", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 5", 0 },
                    { new Guid("00000000-0000-0000-0000-000000000006"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 54, 0, 0, DateTimeKind.Utc), null, 180, "sample_6.mp3", "Pop", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 6", 0 },
                    { new Guid("00000000-0000-0000-0000-000000000007"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 53, 0, 0, DateTimeKind.Utc), null, 180, "sample_7.mp3", "Indie", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 7", 0 },
                    { new Guid("00000000-0000-0000-0000-000000000008"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 52, 0, 0, DateTimeKind.Utc), null, 180, "sample_8.mp3", "Pop", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 8", 0 },
                    { new Guid("00000000-0000-0000-0000-000000000009"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 51, 0, 0, DateTimeKind.Utc), null, 180, "sample_9.mp3", "Indie", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 9", 0 },
                    { new Guid("00000000-0000-0000-0000-000000000010"), null, new Guid("6a37b7b4-757a-436a-b3d9-72fad1565a00"), new DateTime(2026, 6, 4, 23, 50, 0, 0, DateTimeKind.Utc), null, 180, "sample_10.mp3", "Pop", new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"), null, "Sample Track 10", 0 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Albums_ArtistId",
                table: "Albums",
                column: "ArtistId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_MediaItemId",
                table: "Favorites",
                column: "MediaItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Follows_TargetUserId",
                table: "Follows",
                column: "TargetUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_AlbumId",
                table: "MediaItems",
                column: "AlbumId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_ArtistId",
                table: "MediaItems",
                column: "ArtistId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaItems_OwnerId",
                table: "MediaItems",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaShares_MediaItemId",
                table: "MediaShares",
                column: "MediaItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaShares_PlaylistId",
                table: "MediaShares",
                column: "PlaylistId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaShares_ReceiverId",
                table: "MediaShares",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaShares_SenderId",
                table: "MediaShares",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayHistories_MediaItemId",
                table: "PlayHistories",
                column: "MediaItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayHistories_UserId",
                table: "PlayHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Playlists_UserId",
                table: "Playlists",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaylistTracks_MediaItemId",
                table: "PlaylistTracks",
                column: "MediaItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Favorites");

            migrationBuilder.DropTable(
                name: "Follows");

            migrationBuilder.DropTable(
                name: "MediaShares");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "PlayHistories");

            migrationBuilder.DropTable(
                name: "PlaylistTracks");

            migrationBuilder.DropTable(
                name: "MediaItems");

            migrationBuilder.DropTable(
                name: "Playlists");

            migrationBuilder.DropTable(
                name: "Albums");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Artists");
        }
    }
}
