"""
Module: database.py
Hệ thống Quản lý Thư viện - Phan Văn Quân (29214663437)
Cung cấp các hàm tương tác cơ sở dữ liệu SQLite
"""

import sqlite3
import json
import os
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data", "library.db")
SEED_PATH = os.path.join(BASE_DIR, "data", "sample_data.json")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        count INTEGER DEFAULT 0
    )''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        isbn TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        publisher TEXT,
        publishYear INTEGER,
        categoryId TEXT,
        categoryName TEXT,
        totalCopies INTEGER NOT NULL DEFAULT 1,
        availableCopies INTEGER NOT NULL DEFAULT 1,
        location TEXT,
        description TEXT,
        cover TEXT,
        FOREIGN KEY(categoryId) REFERENCES categories(id)
    )''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS readers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        type TEXT DEFAULT 'Sinh viên',
        department TEXT,
        createdDate TEXT,
        expiryDate TEXT,
        status TEXT DEFAULT 'active',
        maxBorrow INTEGER DEFAULT 3,
        currentBorrowCount INTEGER DEFAULT 0
    )''')

    cur.execute('''
    CREATE TABLE IF NOT EXISTS borrow_records (
        id TEXT PRIMARY KEY,
        readerId TEXT NOT NULL,
        readerName TEXT NOT NULL,
        bookId TEXT NOT NULL,
        bookTitle TEXT NOT NULL,
        borrowDate TEXT NOT NULL,
        dueDate TEXT NOT NULL,
        returnDate TEXT,
        status TEXT NOT NULL DEFAULT 'borrowing',
        fineAmount REAL DEFAULT 0,
        notes TEXT,
        renewCount INTEGER DEFAULT 0,
        FOREIGN KEY(readerId) REFERENCES readers(id),
        FOREIGN KEY(bookId) REFERENCES books(id)
    )''')
    
    # Check if empty, then seed
    cur.execute("SELECT COUNT(*) as cnt FROM books")
    if cur.fetchone()["cnt"] == 0 and os.path.exists(SEED_PATH):
        with open(SEED_PATH, "r", encoding="utf-8") as f:
            seed = json.load(f)
            for c in seed["categories"]:
                cur.execute("INSERT OR REPLACE INTO categories VALUES (?, ?, ?, ?)",
                            (c["id"], c["name"], c["icon"], c["count"]))
            for b in seed["books"]:
                cur.execute("INSERT OR REPLACE INTO books VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            (b["id"], b["isbn"], b["title"], b["author"], b["publisher"], b["publishYear"],
                             b["categoryId"], b["categoryName"], b["totalCopies"], b["availableCopies"],
                             b["location"], b["description"], b["cover"]))
            for r in seed["readers"]:
                cur.execute("INSERT OR REPLACE INTO readers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            (r["id"], r["name"], r["email"], r["phone"], r["type"], r["department"],
                             r["createdDate"], r["expiryDate"], r["status"], r["maxBorrow"], r["currentBorrowCount"]))
            for br in seed["borrowRecords"]:
                cur.execute("INSERT OR REPLACE INTO borrow_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            (br["id"], br["readerId"], br["readerName"], br["bookId"], br["bookTitle"],
                             br["borrowDate"], br["dueDate"], br["returnDate"], br["status"],
                             br["fineAmount"], br["notes"], br["renewCount"]))
    
    conn.commit()
    conn.close()

def reset_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    init_db()

# Statistics
def get_stats():
    conn = get_connection()
    cur = conn.cursor()
    
    total_books = cur.execute("SELECT COUNT(*) as c FROM books").fetchone()["c"]
    total_copies = cur.execute("SELECT SUM(totalCopies) as c FROM books").fetchone()["c"] or 0
    available_copies = cur.execute("SELECT SUM(availableCopies) as c FROM books").fetchone()["c"] or 0
    total_readers = cur.execute("SELECT COUNT(*) as c FROM readers").fetchone()["c"]
    borrowing_count = cur.execute("SELECT COUNT(*) as c FROM borrow_records WHERE status = 'borrowing'").fetchone()["c"]
    overdue_count = cur.execute("SELECT COUNT(*) as c FROM borrow_records WHERE status = 'overdue'").fetchone()["c"]
    total_fines = cur.execute("SELECT SUM(fineAmount) as c FROM borrow_records").fetchone()["c"] or 0
    
    # Category distribution
    categories = [dict(row) for row in cur.execute("SELECT categoryName, COUNT(*) as count FROM books GROUP BY categoryName").fetchall()]
    
    # Recent borrows
    recent_borrows = [dict(row) for row in cur.execute("SELECT * FROM borrow_records ORDER BY borrowDate DESC LIMIT 5").fetchall()]
    
    conn.close()
    return {
        "totalBooks": total_books,
        "totalCopies": total_copies,
        "availableCopies": available_copies,
        "borrowedCopies": total_copies - available_copies,
        "totalReaders": total_readers,
        "borrowingCount": borrowing_count,
        "overdueCount": overdue_count,
        "totalFines": total_fines,
        "categories": categories,
        "recentBorrows": recent_borrows
    }

# Books CRUD
def get_all_books(search="", category=""):
    conn = get_connection()
    cur = conn.cursor()
    query = "SELECT * FROM books WHERE 1=1"
    params = []
    if search:
        query += " AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])
    if category:
        query += " AND (categoryId = ? OR categoryName = ?)"
        params.extend([category, category])
    query += " ORDER BY id DESC"
    rows = cur.execute(query, params).fetchall()
    books = [dict(r) for r in rows]
    conn.close()
    return books

def get_book_by_id(book_id):
    conn = get_connection()
    cur = conn.cursor()
    row = cur.execute("SELECT * FROM books WHERE id = ?", (book_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def create_book(book_data):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('''
    INSERT INTO books (id, isbn, title, author, publisher, publishYear, categoryId, categoryName, totalCopies, availableCopies, location, description, cover)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        book_data["id"], book_data["isbn"], book_data["title"], book_data["author"],
        book_data.get("publisher", ""), book_data.get("publishYear", 2024),
        book_data.get("categoryId", "CAT01"), book_data.get("categoryName", "Công nghệ thông tin"),
        book_data.get("totalCopies", 1), book_data.get("availableCopies", 1),
        book_data.get("location", "Kệ A1-01"), book_data.get("description", ""),
        book_data.get("cover", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400")
    ))
    conn.commit()
    conn.close()
    return get_book_by_id(book_data["id"])

def update_book(book_id, book_data):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('''
    UPDATE books SET
        title = ?, author = ?, publisher = ?, publishYear = ?,
        categoryId = ?, categoryName = ?, totalCopies = ?, availableCopies = ?,
        location = ?, description = ?, cover = ?
    WHERE id = ?
    ''', (
        book_data["title"], book_data["author"], book_data.get("publisher", ""),
        book_data.get("publishYear", 2024), book_data.get("categoryId", "CAT01"),
        book_data.get("categoryName", ""), book_data.get("totalCopies", 1),
        book_data.get("availableCopies", 1), book_data.get("location", ""),
        book_data.get("description", ""), book_data.get("cover", ""), book_id
    ))
    conn.commit()
    conn.close()
    return get_book_by_id(book_id)

def delete_book(book_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM books WHERE id = ?", (book_id,))
    conn.commit()
    conn.close()
    return True

# Readers CRUD
def get_all_readers(search=""):
    conn = get_connection()
    cur = conn.cursor()
    query = "SELECT * FROM readers WHERE 1=1"
    params = []
    if search:
        query += " AND (name LIKE ? OR id LIKE ? OR email LIKE ?)"
        s = f"%{search}%"
        params.extend([s, s, s])
    query += " ORDER BY id DESC"
    rows = cur.execute(query, params).fetchall()
    readers = [dict(r) for r in rows]
    conn.close()
    return readers

def get_reader_by_id(reader_id):
    conn = get_connection()
    cur = conn.cursor()
    row = cur.execute("SELECT * FROM readers WHERE id = ?", (reader_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def create_reader(reader_data):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('''
    INSERT INTO readers (id, name, email, phone, type, department, createdDate, expiryDate, status, maxBorrow, currentBorrowCount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        reader_data["id"], reader_data["name"], reader_data.get("email", ""),
        reader_data.get("phone", ""), reader_data.get("type", "Sinh viên"),
        reader_data.get("department", "Công nghệ thông tin"),
        reader_data.get("createdDate", datetime.now().strftime("%Y-%m-%d")),
        reader_data.get("expiryDate", (datetime.now() + timedelta(days=365*4)).strftime("%Y-%m-%d")),
        reader_data.get("status", "active"), reader_data.get("maxBorrow", 3), 0
    ))
    conn.commit()
    conn.close()
    return get_reader_by_id(reader_data["id"])

def update_reader(reader_id, reader_data):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('''
    UPDATE readers SET
        name = ?, email = ?, phone = ?, type = ?,
        department = ?, status = ?, maxBorrow = ?
    WHERE id = ?
    ''', (
        reader_data["name"], reader_data.get("email", ""),
        reader_data.get("phone", ""), reader_data.get("type", "Sinh viên"),
        reader_data.get("department", ""), reader_data.get("status", "active"),
        reader_data.get("maxBorrow", 3), reader_id
    ))
    conn.commit()
    conn.close()
    return get_reader_by_id(reader_id)

def delete_reader(reader_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM readers WHERE id = ?", (reader_id,))
    conn.commit()
    conn.close()
    return True

# Borrows CRUD & Business Logic
def get_all_borrows(status=""):
    conn = get_connection()
    cur = conn.cursor()
    query = "SELECT * FROM borrow_records WHERE 1=1"
    params = []
    if status:
        query += " AND status = ?"
        params.append(status)
    query += " ORDER BY borrowDate DESC"
    rows = cur.execute(query, params).fetchall()
    records = [dict(r) for r in rows]
    conn.close()
    return records

def create_borrow_record(data):
    conn = get_connection()
    cur = conn.cursor()
    
    # 1. Check reader
    reader = cur.execute("SELECT * FROM readers WHERE id = ?", (data["readerId"],)).fetchone()
    if not reader:
        conn.close()
        raise ValueError(f"Độc giả {data['readerId']} không tồn tại!")
    
    if reader["status"] != "active":
        conn.close()
        raise ValueError(f"Thẻ độc giả {reader['name']} đang bị khóa ({reader['status']})!")
    
    if reader["currentBorrowCount"] >= reader["maxBorrow"]:
        conn.close()
        raise ValueError(f"Độc giả đã mượn tối đa {reader['maxBorrow']} cuốn sách!")
    
    # Check overdue records for this reader
    overdue_rec = cur.execute("SELECT * FROM borrow_records WHERE readerId = ? AND status = 'overdue'", (data["readerId"],)).fetchone()
    if overdue_rec:
        conn.close()
        raise ValueError(f"Độc giả đang có sách quá hạn chưa hoàn trả! Không thể mượn thêm.")

    # 2. Check book
    book = cur.execute("SELECT * FROM books WHERE id = ?", (data["bookId"],)).fetchone()
    if not book:
        conn.close()
        raise ValueError(f"Sách {data['bookId']} không tồn tại!")
    
    if book["availableCopies"] <= 0:
        conn.close()
        raise ValueError(f"Sách '{book['title']}' đã hết trong kho!")
    
    # Dates
    borrow_date = data.get("borrowDate", datetime.now().strftime("%Y-%m-%d"))
    days = 14 if reader["type"] == "Sinh viên" else 30
    due_date = (datetime.strptime(borrow_date, "%Y-%m-%d") + timedelta(days=days)).strftime("%Y-%m-%d")
    rec_id = f"BR{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Insert record
    cur.execute('''
    INSERT INTO borrow_records (id, readerId, readerName, bookId, bookTitle, borrowDate, dueDate, returnDate, status, fineAmount, notes, renewCount)
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 'borrowing', 0, ?, 0)
    ''', (rec_id, reader["id"], reader["name"], book["id"], book["title"], borrow_date, due_date, data.get("notes", "")))
    
    # Decrement availableCopies
    cur.execute("UPDATE books SET availableCopies = availableCopies - 1 WHERE id = ?", (book["id"],))
    
    # Increment currentBorrowCount
    cur.execute("UPDATE readers SET currentBorrowCount = currentBorrowCount + 1 WHERE id = ?", (reader["id"],))
    
    conn.commit()
    row = cur.execute("SELECT * FROM borrow_records WHERE id = ?", (rec_id,)).fetchone()
    conn.close()
    return dict(row)

def return_borrow_record(record_id):
    conn = get_connection()
    cur = conn.cursor()
    
    rec = cur.execute("SELECT * FROM borrow_records WHERE id = ?", (record_id,)).fetchone()
    if not rec:
        conn.close()
        raise ValueError("Phiếu mượn không tồn tại!")
    
    if rec["status"] == "returned":
        conn.close()
        raise ValueError("Sách này đã được trả trước đó!")
    
    return_date = datetime.now().strftime("%Y-%m-%d")
    due_date = datetime.strptime(rec["dueDate"], "%Y-%m-%d")
    ret_dt = datetime.strptime(return_date, "%Y-%m-%d")
    
    fine = 0
    if ret_dt > due_date:
        overdue_days = (ret_dt - due_date).days
        fine = overdue_days * 5000
        
    cur.execute('''
    UPDATE borrow_records SET returnDate = ?, status = 'returned', fineAmount = ?
    WHERE id = ?
    ''', (return_date, fine, record_id))
    
    # Increase book availableCopies
    cur.execute("UPDATE books SET availableCopies = availableCopies + 1 WHERE id = ?", (rec["bookId"],))
    
    # Decrease reader currentBorrowCount
    cur.execute("UPDATE readers SET currentBorrowCount = MAX(0, currentBorrowCount - 1) WHERE id = ?", (rec["readerId"],))
    
    conn.commit()
    updated = cur.execute("SELECT * FROM borrow_records WHERE id = ?", (record_id,)).fetchone()
    conn.close()
    return dict(updated)

def renew_borrow_record(record_id):
    conn = get_connection()
    cur = conn.cursor()
    
    rec = cur.execute("SELECT * FROM borrow_records WHERE id = ?", (record_id,)).fetchone()
    if not rec:
        conn.close()
        raise ValueError("Phiếu mượn không tồn tại!")
    
    if rec["status"] != "borrowing":
        conn.close()
        raise ValueError("Chỉ có thể gia hạn khi phiếu ở trạng thái Đang mượn!")
    
    if rec["renewCount"] >= 1:
        conn.close()
        raise ValueError("Phiếu mượn này đã gia hạn tối đa (1 lần)!")
    
    curr_due = datetime.strptime(rec["dueDate"], "%Y-%m-%d")
    new_due = (curr_due + timedelta(days=7)).strftime("%Y-%m-%d")
    
    cur.execute('''
    UPDATE borrow_records SET dueDate = ?, renewCount = renewCount + 1, notes = notes || ' [Đã gia hạn +7 ngày]'
    WHERE id = ?
    ''', (new_due, record_id))
    
    conn.commit()
    updated = cur.execute("SELECT * FROM borrow_records WHERE id = ?", (record_id,)).fetchone()
    conn.close()
    return dict(updated)
