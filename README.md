# HỆ THỐNG QUẢN LÝ THƯ VIỆN THÔNG MINH ỨNG DỤNG CÔNG CỤ AI (SMARTLIB AI)

> **BÀI THỰC HÀNH 02 (LAB 02)**: Phân tích, thiết kế và xây dựng hệ thống quản lý thư viện ứng dụng công cụ AI  
> **Sinh viên thực hiện**: **Phan Văn Quân**  
> **Mã số sinh viên (MSSV)**: **29214663437**  
> **GitHub Repository**: [https://github.com/PhanQuan26/Lab_QLThuVien_29214663437_PhanVanQuan](https://github.com/PhanQuan26/Lab_QLThuVien_29214663437_PhanVanQuan)  
> **Công cụ AI ứng dụng**: Google AI Studio (Gemini 1.5/2.0), Antigravity IDE  

---

## 1. Giới thiệu tổng quan
Ứng dụng **SmartLib AI** là phần mềm quản lý thư viện đại học số hóa toàn diện, giải quyết triệt để các hạn chế của phương pháp quản lý sổ sách truyền thống:
- **Tự động hóa toàn trình mượn - trả**: Kiểm tra điều kiện mượn theo đối tượng (Sinh viên tối đa 3 cuốn/14 ngày, Giảng viên 5 cuốn/30 ngày), kiểm tra tồn kho, cảnh báo thẻ bị khóa hoặc có sách trễ hạn.
- **Tính toán tiền phạt tự động**: Tự động tính phí phạt trễ hạn 5.000 VNĐ / ngày khi độc giả hoàn trả quá hạn.
- **Quản lý danh mục & kho sách**: Quản lý bản in, vị trí kệ lưu trữ, mã ISBN, phân loại thể loại đa cấp.
- **Trợ lý AI Gemini thông minh**: Tích hợp Google Gemini từ Google AI Studio hỗ trợ bạn đọc gợi ý tài liệu học tập, tóm tắt sách, tra cứu nội quy và vị trí sách tự động.
- **Kiến trúc Dual-Mode linh hoạt**: Hoạt động mượt mà ở cả 2 chế độ:
  1. *Server Mode*: RESTful API (FastAPI + SQLite DB `library.db`).
  2. *Offline Mode*: Tự động chạy với LocalStorage khi mở trực tiếp file `index.html` trong trình duyệt mà không cần cài đặt backend.

---

## 2. Cấu trúc thư mục dự án

```text
Lab_QLThuVien_29214663437_PhanVanQuan/
├── src/                               # Toàn bộ mã nguồn ứng dụng
│   ├── public/                        # Giao diện người dùng Web Application
│   │   ├── css/
│   │   │   └── style.css              # Giao diện hiện đại, Dark/Light mode, Responsive
│   │   ├── js/
│   │   │   └── app.js                 # Xử lý nghiệp vụ, giao tiếp REST API & LocalStorage
│   │   └── index.html                 # Trang chủ Dashboard quản lý thư viện
│   ├── data/
│   │   ├── library.db                 # Cơ sở dữ liệu SQLite
│   │   └── sample_data.json           # Dữ liệu mẫu ban đầu (Sách, Độc giả, Phiếu mượn)
│   ├── __init__.py
│   ├── database.py                    # Module tương tác SQLite CRUD & nghiệp vụ
│   ├── ai_service.py                  # Module AI tích hợp Google Gemini & Knowledge Base
│   └── server.py                      # FastAPI Backend & Web Static Server
├── docs/                              # Tài liệu & Báo cáo
│   ├── images/                        # Ảnh minh chứng Google AI Studio & Antigravity IDE
│   │   ├── google_ai_studio_prompt.png
│   │   ├── antigravity_ide_workspace.png
│   │   └── system_architecture_diagram.png
│   ├── BaoCao_Lab.md                  # Báo cáo phân tích thiết kế chi tiết (Markdown)
│   └── BaoCao_Lab.pdf                 # Báo cáo in ấn định dạng PDF chuyên nghiệp
├── run_app.bat                        # File kích hoạt chạy nhanh ứng dụng (1-Click Run)
└── README.md                          # Hướng dẫn cài đặt và sử dụng
```

---

## 3. Hướng dẫn khởi chạy ứng dụng

### Cách 1: Khởi chạy nhanh 1-Click (Khuyên dùng trên Windows)
- Nhấp đúp chuột vào file **`run_app.bat`** tại thư mục gốc của dự án.
- Script sẽ tự động kiểm tra môi trường, bật máy chủ Backend và mở trình duyệt tại địa chỉ:  
  👉 **http://127.0.0.1:8000**

---

### Cách 2: Khởi chạy thủ công bằng dòng lệnh (Terminal / PowerShell)

1. Mở Terminal tại thư mục `Lab_QLThuVien_29214663437_PhanVanQuan`.
2. Chạy lệnh khởi động máy chủ FastAPI:
   ```bash
   python -m uvicorn src.server:app --host 127.0.0.1 --port 8000 --reload
   ```
3. Truy cập vào ứng dụng:
   - Giao diện Web: [http://127.0.0.1:8000](http://127.0.0.1:8000)
   - Tài liệu API tương tác (Swagger UI): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Cách 3: Mở trực tiếp không cần cài đặt (Chế độ Standalone / Offline)
- Mở trực tiếp file sau bằng bất kỳ trình duyệt web nào (Chrome, Edge, Firefox):  
  👉 `src/public/index.html`
- Ứng dụng sẽ tự động chuyển sang chế độ **LocalStorage Mode (Offline)** với đầy đủ dữ liệu mẫu và toàn bộ chức năng mượn/trả, biểu đồ thống kê, tìm kiếm và trợ lý AI nội bộ!

---

## 4. Dữ liệu mẫu có sẵn để thử nghiệm

Hệ thống đã nạp sẵn bộ dữ liệu thực tế:
- **12 đầu sách tiêu biểu** thuộc các lĩnh vực: Công nghệ thông tin, Trí tuệ nhân tạo (AI), Khoa học dữ liệu, Kinh tế, Kỹ năng sống.
- **5 độc giả thử nghiệm**:
  1. `29214663437` - **Phan Văn Quân** (Sinh viên CNTT - Đang mượn 1 cuốn).
  2. `29214661001` - **Nguyễn Thị Thu Hà** (Sinh viên HTTT - Đang mượn 2 cuốn, trong đó có 1 cuốn quá hạn 15 ngày).
  3. `GV2019001` - **TS. Lê Hoàng Nam** (Giảng viên KHMT - Đã trả sách đúng hạn).
  4. `29214663005` - **Vũ Đình Trọng** (Sinh viên - Thẻ tạm khóa do có sách quá hạn lâu ngày).
  5. `29214662002` - **Trần Văn Hưng** (Sinh viên KTPM - Chưa mượn sách, sẵn sàng mượn).

---

## 5. Kho lưu trữ GitHub (Repository)

Dự án đã được đẩy lên GitHub tại địa chỉ chính thức:  
👉 **[https://github.com/PhanQuan26/Lab_QLThuVien_29214663437_PhanVanQuan](https://github.com/PhanQuan26/Lab_QLThuVien_29214663437_PhanVanQuan)**

Để tải về hoặc cập nhật mã nguồn:
```bash
git clone https://github.com/PhanQuan26/Lab_QLThuVien_29214663437_PhanVanQuan.git
```

---
*Bản quyền thực hiện: Sinh viên **Phan Văn Quân** - MSSV: **29214663437** - Lớp DTECS231C.*
