# TODO - TuneVault

## Email share bài hát (khi receiver nhập email)
- [ ] Tạo `EmailShareService` (SMTP) + interface
- [ ] Thêm cấu hình SMTP + BaseUrl trong `Backend/TuneVault.API/appsettings*.json`
- [ ] Update `ShareMediaHandler` để:
  - [ ] Detect receiver input có phải email hay không
  - [ ] Nếu là email: gửi email cho receiver.Email
  - [ ] Body email có link placeholder `/song/{mediaId}` hoặc `/playlist/{playlistId}`
- [ ] Register DI trong `Backend/TuneVault.API/Program.cs`
- [ ] Build / kiểm tra compile

