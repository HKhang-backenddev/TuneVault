# 🎵 TuneVault API

TuneVault là một ứng dụng quản lý và phát nhạc trực tuyến được xây dựng bằng .NET Web API và Frontend.

## 🚀 Tính năng chính
* Quản lý kho nhạc, nghệ sĩ và album.
* Phát nhạc trực tuyến (Streaming audio).
* Hệ thống phân quyền và bảo mật ứng dụng.

## 🛠️ Công nghệ sử dụng
* **Backend:** .NET 8 / C#
* **Frontend:** Node.js (React / Vue / Angular...)
* **Database:** SQL Server / Entity Framework Core
* **Tools:** Git

---

## 💻 Hướng dẫn Khởi chạy Dự án ở Local

Để khởi chạy và thử nghiệm toàn bộ hệ thống, bạn cần mở **2 cửa sổ Terminal / Command Prompt** độc lập để chạy song song cả Backend và Frontend theo hướng dẫn chi tiết dưới đây:

### 🛠️ Bước 1: Khởi chạy Backend (.NET Web API)
Mở cửa sổ Terminal thứ nhất, sử dụng lệnh `cd` để di chuyển vào thư mục chứa mã nguồn API. Sau đó, chạy dự án bằng lệnh `dotnet watch run`. Lệnh này giúp kích hoạt chế độ theo dõi thay đổi, hệ thống sẽ tự động biên dịch và tải lại mỗi khi bạn chỉnh sửa mã nguồn backend.

1. Trỏ vào thư mục Backend/TuneVault.API 
```bash
cd Backend/TuneVault.API
```
2. Chạy lệnh để tạo swagger
```bash
dotnet watch run
```

### 💻 Bước 2: Khởi chạy Giao diện Frontend
Mở cửa sổ Terminal thứ hai để quản lý phần giao diện. Trước hết, bạn dùng lệnh cd di chuyển vào thư mục Frontend. Nếu đây là lần đầu tiên chạy dự án trên máy, bạn cần chạy lệnh npm install để tải và cài đặt toàn bộ các thư viện đóng gói cần thiết. Cuối cùng, khởi động server local bằng lệnh npm run dev.

1. Trỏ vào thư mục Frontend

```bash
cd Frontend
```

2. Cài đặt thư viện
   
```bash
npm install //neu chua cai dat
```

3. Chạy giao diện Web

```bash
npm run dev
```
4. Mở trình duyệt và truy cập http://localhost:5173. Frontend sẽ tự động kết nối với Backend đang chạy online.
