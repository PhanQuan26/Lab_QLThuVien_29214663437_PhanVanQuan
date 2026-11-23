"""
HỆ THỐNG QUẢN LÝ THƯ VIỆN ỨNG DỤNG CÔNG CỤ AI
Sinh viên thực hiện: Phan Văn Quân - MSSV: 29214663437
FastAPI Server & RESTful API Backend
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from . import database
from .ai_service import ai_assistant

app = FastAPI(
    title="Hệ thống Quản lý Thư viện AI",
    description="Backend API phát triển bởi Phan Văn Quân - MSSV: 29214663437",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
database.init_db()

# Models
class BookModel(BaseModel):
    id: str
    isbn: str
    title: str
    author: str
    publisher: Optional[str] = ""
    publishYear: Optional[int] = 2024
    categoryId: Optional[str] = "CAT01"
    categoryName: Optional[str] = "Công nghệ thông tin"
    totalCopies: Optional[int] = 1
    availableCopies: Optional[int] = 1
    location: Optional[str] = "Kệ A1-01"
    description: Optional[str] = ""
    cover: Optional[str] = ""

class ReaderModel(BaseModel):
    id: str
    name: str
    email: Optional[str] = ""
    phone: Optional[str] = ""
    type: Optional[str] = "Sinh viên"
    department: Optional[str] = "Công nghệ thông tin"
    createdDate: Optional[str] = None
    expiryDate: Optional[str] = None
    status: Optional[str] = "active"
    maxBorrow: Optional[int] = 3

class BorrowModel(BaseModel):
    readerId: str
    bookId: str
    borrowDate: Optional[str] = None
    notes: Optional[str] = ""

class AIQueryModel(BaseModel):
    prompt: str
    apiKey: Optional[str] = None

# --- API Endpoints ---

@app.get("/api/stats")
def get_stats():
    return database.get_stats()

# Books
@app.get("/api/books")
def list_books(search: str = "", category: str = ""):
    return database.get_all_books(search, category)

@app.get("/api/books/{book_id}")
def get_book(book_id: str):
    book = database.get_book_by_id(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách")
    return book

@app.post("/api/books")
def add_book(book: BookModel):
    try:
        return database.create_book(book.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/books/{book_id}")
def edit_book(book_id: str, book: BookModel):
    try:
        updated = database.update_book(book_id, book.dict())
        if not updated:
            raise HTTPException(status_code=404, detail="Không tìm thấy sách để cập nhật")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/books/{book_id}")
def remove_book(book_id: str):
    return {"success": database.delete_book(book_id)}

# Readers
@app.get("/api/readers")
def list_readers(search: str = ""):
    return database.get_all_readers(search)

@app.get("/api/readers/{reader_id}")
def get_reader(reader_id: str):
    reader = database.get_reader_by_id(reader_id)
    if not reader:
        raise HTTPException(status_code=404, detail="Không tìm thấy độc giả")
    return reader

@app.post("/api/readers")
def add_reader(reader: ReaderModel):
    try:
        return database.create_reader(reader.dict())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/readers/{reader_id}")
def edit_reader(reader_id: str, reader: ReaderModel):
    try:
        updated = database.update_reader(reader_id, reader.dict())
        if not updated:
            raise HTTPException(status_code=404, detail="Không tìm thấy độc giả để cập nhật")
        return updated
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/readers/{reader_id}")
def remove_reader(reader_id: str):
    return {"success": database.delete_reader(reader_id)}

# Borrow & Return
@app.get("/api/borrows")
def list_borrows(status: str = ""):
    return database.get_all_borrows(status)

@app.post("/api/borrows")
def borrow_book(data: BorrowModel):
    try:
        return database.create_borrow_record(data.dict())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/borrows/{record_id}/return")
def return_book(record_id: str):
    try:
        return database.return_borrow_record(record_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/borrows/{record_id}/renew")
def renew_book(record_id: str):
    try:
        return database.renew_borrow_record(record_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# AI Assistant
@app.post("/api/ai/ask")
def ask_ai(req: AIQueryModel):
    return ai_assistant.ask(req.prompt, req.apiKey)

# Reset Database
@app.post("/api/reset")
def reset_database():
    database.reset_db()
    return {"message": "Đã khôi phục dữ liệu ban đầu thành công"}

# Static Files & SPA Frontend
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

if os.path.exists(PUBLIC_DIR):
    app.mount("/static", StaticFiles(directory=PUBLIC_DIR), name="static")

@app.get("/")
def serve_index():
    index_file = os.path.join(PUBLIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Library Management System API is running. Public index.html not found."}

if __name__ == "__main__":
    import uvicorn
    print("\n=======================================================")
    print("   HỆ THỐNG QUẢN LÝ THƯ VIỆN THÔNG MINH ỨNG DỤNG AI   ")
    print("   Sinh viên thực hiện: Phan Văn Quân - 29214663437   ")
    print("=======================================================")
    print("-> Web App đang chạy tại: http://127.0.0.1:8000")
    print("-> Swagger API Docs:      http://127.0.0.1:8000/docs")
    print("=======================================================\n")
    uvicorn.run("src.server:app", host="127.0.0.1", port=8000, reload=True)
