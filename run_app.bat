@echo off
chcp 65001 > nul
title HỆ THỐNG QUẢN LÝ THƯ VIỆN AI - PHAN VĂN QUÂN (29214663437)
color 0b

echo =========================================================================
echo    TRƯỜNG ĐẠI HỌC - KHOA CÔNG NGHỆ THÔNG TIN
echo    LAB 02: HỆ THỐNG QUẢN LÝ THƯ VIỆN ỨNG DỤNG CÔNG CỤ AI
echo    Sinh viên thực hiện : Phan Văn Quân
echo    Mã số sinh viên     : 29214663437
echo =========================================================================
echo.
echo Đang kiểm tra môi trường và khởi động máy chủ ứng dụng...
echo.

python -c "import fastapi, uvicorn" > nul 2>&1
if %errorlevel% neq 0 (
    echo [THÔNG BÁO] Không tìm thấy thư viện FastAPI.
    echo Đang tự động mở giao diện ứng dụng chế độ Offline (LocalStorage)...
    start "" "src\public\index.html"
    pause
    exit /b
)

echo [OK] Đã sẵn sàng môi trường Python FastAPI!
echo [OK] Đang khởi chạy máy chủ tại: http://127.0.0.1:8000
echo.

start "" "http://127.0.0.1:8000"
python -m uvicorn src.server:app --host 127.0.0.1 --port 8000 --reload

pause
