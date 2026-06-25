using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TuneVault.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNewProfileFieldsToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MediaShares_Playlists_PlaylistId",
                table: "MediaShares");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_MediaShares_PlaylistId",
                table: "MediaShares");

            migrationBuilder.AddColumn<string>(
                name: "BannerUrl",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GithubUrl",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwitterUrl",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "Notifications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track1/300/300");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track2/300/300");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track3/300/300");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000004"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track4/300/300");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000005"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track5/300/300");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000006"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track6/300/300");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000007"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track7/300/300");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000008"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track8/300/300");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000009"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track9/300/300");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000010"),
                column: "ThumbnailUrl",
                value: "https://picsum.photos/seed/track10/300/300");

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"),
                columns: new[] { "BannerUrl", "GithubUrl", "Location", "PasswordHash", "TwitterUrl", "WebsiteUrl" },
                values: new object[] { null, null, null, "8C6976E5B5410415BDE908BD4DEE15DFB167A9C873FC4BB8A81F6F2AB448A918", null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BannerUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GithubUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TwitterUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Message",
                table: "Notifications");

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000004"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000005"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000006"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000007"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000008"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000009"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "MediaItems",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000010"),
                column: "ThumbnailUrl",
                value: null);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("3872327a-4302-4e5c-a58a-ca48edd2b108"),
                column: "PasswordHash",
                value: "$2a$11$mCUXAn3mSps0N8p9v9.7be0.U9.r0.C9Uj6N9Z6U1X7Z6U1X7Z6U1");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MediaShares_PlaylistId",
                table: "MediaShares",
                column: "PlaylistId");

            migrationBuilder.AddForeignKey(
                name: "FK_MediaShares_Playlists_PlaylistId",
                table: "MediaShares",
                column: "PlaylistId",
                principalTable: "Playlists",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Users_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
