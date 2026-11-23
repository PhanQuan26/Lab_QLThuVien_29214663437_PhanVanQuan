"""
Module: ai_service.py
Hệ thống Trợ lý Thư viện Thông minh - Phan Văn Quân (29214663437)
Tích hợp Google Gemini AI và Hệ tri thức Thư viện nội bộ
"""

import os
import json
import requests
from . import database

class LibraryAIAssistant:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY", "")

    def ask(self, prompt: str, api_key: str = None) -> dict:
        key = api_key or self.api_key
        # Check if user wants to use live Gemini API
        if key:
            try:
                gemini_res = self._call_gemini_api(prompt, key)
                if gemini_res:
                    return {
                        "source": "Google Gemini API (Live)",
                        "response": gemini_res
                    }
            except Exception as e:
                # Fallback to local expert engine if API call fails
                local_res = self._local_knowledge_engine(prompt)
                return {
                    "source": "AI Knowledge Engine (Fallback do lỗi kết nối API)",
                    "response": f"{local_res}\n\n*(Ghi chú: Đã chuyển sang bộ tri thức nội bộ do kết nối API báo lỗi: {str(e)})*"
                }

        # Local AI Knowledge Engine
        return {
            "source": "AI Library Assistant Engine (Nội bộ)",
            "response": self._local_knowledge_engine(prompt)
        }

    def _call_gemini_api(self, prompt: str, api_key: str) -> str:
        # Construct context with current catalog
        books = database.get_all_books()
        book_context = "\n".join([f"- [{b['id']}] {b['title']} (Tác giả: {b['author']}, Thể loại: {b['categoryName']}, Vị trí: {b['location']}, Còn lại: {b['availableCopies']}/{b['totalCopies']})" for b in books[:10]])
        
        system_instruction = f"""
Bạn là Trợ lý Thư viện Thông minh được phát triển bởi sinh viên Phan Văn Quân (MSSV: 29214663437) trong đề tài Lab Quản lý Thư viện AI.
Nhiệm vụ của bạn:
1. Tư vấn, gợi ý sách dựa trên nhu cầu học tập, nghiên cứu của độc giả.
2. Giải đáp quy định mượn/trả sách (Sinh viên tối đa 3 cuốn/14 ngày, Giảng viên 5 cuốn/30 ngày, gia hạn thêm 7 ngày 1 lần, phí quá hạn 5.000 VNĐ/ngày).
3. Tóm tắt nội dung sách theo yêu cầu.
Dưới đây là một số đầu sách mẫu hiện có trong thư viện:
{book_context}
Hãy trả lời một cách lịch sự, súc tích, chuyên nghiệp bằng tiếng Việt và hỗ trợ định dạng Markdown.
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_instruction}\n\nCâu hỏi của độc giả: {prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 800
            }
        }
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
        else:
            raise Exception(f"HTTP {resp.status_code}: {resp.text}")

    def _local_knowledge_engine(self, query: str) -> str:
        q = query.lower()
        books = database.get_all_books()
        
        # 1. Rules & Regulations
        if any(w in q for w in ["quy định", "mượn tối đa", "bao nhiêu cuốn", "mấy quyển", "hạn mượn", "thời gian mượn"]):
            return (
                "### 📜 Quy định Mượn - Trả sách của Thư viện:\n\n"
                "1. **Đối tượng Sinh viên**:\n"
                "   - Số lượng mượn tối đa: **3 cuốn/lần**.\n"
                "   - Thời hạn mượn: **14 ngày**.\n"
                "2. **Đối tượng Giảng viên**:\n"
                "   - Số lượng mượn tối đa: **5 cuốn/lần**.\n"
                "   - Thời hạn mượn: **30 ngày**.\n"
                "3. **Chính sách gia hạn**:\n"
                "   - Mỗi phiếu mượn được gia hạn **tối đa 1 lần** (thêm **7 ngày**).\n"
                "   - Điều kiện: Sách chưa quá hạn và không có bạn đọc khác đặt trước.\n"
                "4. **Phí phạt quá hạn**:\n"
                "   - Phí phạt: **5.000 VNĐ / ngày / cuốn** quá hạn.\n"
                "   - Thẻ độc giả sẽ bị tạm khóa nếu có sách quá hạn chưa thanh toán."
            )
            
        # 2. Overdue & Fines
        if any(w in q for w in ["phạt", "quá hạn", "trễ hạn", "tiền phạt"]):
            return (
                "### ⚠️ Quy định Xử lý Quá hạn & Tiền phạt:\n\n"
                "- **Mức phạt**: **5.000 VNĐ** cho mỗi ngày quá hạn trên mỗi đầu sách.\n"
                "- **Hình thức chế tài**: Độc giả có sách quá hạn sẽ bị **khóa quyền mượn sách mới** cho đến khi hoàn trả đầy đủ sách và nộp phí phạt.\n"
                "- **Làm mất sách**: Độc giả phải bồi thường cuốn sách mới cùng loại hoặc đền bù 100% giá trị sách theo quy định hội đồng thư viện."
            )

        # 3. Recommendations for AI / Machine Learning
        if any(w in q for w in ["ai", "trí tuệ nhân tạo", "machine learning", "học máy", "deep learning", "học sâu"]):
            matching = [b for b in books if any(k in b["title"].lower() or k in b["categoryName"].lower() for k in ["trí tuệ nhân tạo", "deep learning", "học sâu", "ai"])]
            res = "### 🤖 Gợi ý sách chuyên ngành Trí tuệ nhân tạo & AI:\n\n"
            for b in matching:
                res += f"- **{b['title']}** (Mã: `{b['id']}`)\n  - Tác giả: {b['author']}\n  - Vị trí: `{b['location']}` | Còn lại: **{b['availableCopies']}/{b['totalCopies']}** cuốn\n  - *Tóm lược*: {b['description']}\n\n"
            res += "💡 *Lời khuyên từ AI*: Nếu bạn mới bắt đầu, hãy đọc cuốn *'Trí tuệ nhân tạo: Tiếp cận hiện đại'* để nắm chắc lý thuyết nền tảng trước khi thực hành sâu với Deep Learning!"
            return res

        # 4. Programming / Software Engineering
        if any(w in q for w in ["lập trình", "code", "phần mềm", "web", "clean code", "thuật toán", "cấu trúc dữ liệu"]):
            matching = [b for b in books if any(k in b["title"].lower() or k in b["categoryName"].lower() for k in ["code", "cấu trúc", "web", "thuật toán", "cơ sở dữ liệu"])]
            res = "### 💻 Gợi ý sách Công nghệ thông tin & Lập trình:\n\n"
            for b in matching:
                res += f"- **{b['title']}** (Mã: `{b['id']}`)\n  - Tác giả: {b['author']}\n  - Vị trí: `{b['location']}` | Tình trạng: Còn **{b['availableCopies']}** cuốn\n  - *Tóm lược*: {b['description']}\n\n"
            res += "💡 *Gợi ý*: Cuốn **'Clean Code'** là tài liệu kinh điển giúp bạn nâng cao tư duy refactor mã nguồn chuẩn công nghiệp!"
            return res

        # 5. Economics / Startup / Business
        if any(w in q for w in ["kinh tế", "khởi nghiệp", "quản trị", "startup", "kinh doanh"]):
            matching = [b for b in books if "kinh tế" in b["categoryName"].lower() or "khởi nghiệp" in b["title"].lower()]
            res = "### 📈 Gợi ý sách Kinh tế & Khởi nghiệp đổi mới sáng tạo:\n\n"
            for b in matching:
                res += f"- **{b['title']}** (Mã: `{b['id']}`)\n  - Tác giả: {b['author']} | Kệ: `{b['location']}`\n  - *Tóm lược*: {b['description']}\n\n"
            return res

        # 6. Life skills / Self help
        if any(w in q for w in ["kỹ năng", "đắc nhân tâm", "tư duy", "phát triển"]):
            matching = [b for b in books if "kỹ năng" in b["categoryName"].lower()]
            res = "### 🌟 Sách Kỹ năng sống & Phát triển bản thân:\n\n"
            for b in matching:
                res += f"- **{b['title']}** (Mã: `{b['id']}`)\n  - Tác giả: {b['author']} | Vị trí: `{b['location']}`\n  - *Tóm lược*: {b['description']}\n\n"
            return res

        # 7. Specific Book lookup
        for b in books:
            if b["title"].lower() in q or b["id"].lower() == q.strip():
                return (
                    f"### 📖 Chi tiết đầu sách: {b['title']}\n\n"
                    f"- **Mã sách**: `{b['id']}`\n"
                    f"- **ISBN**: {b['isbn']}\n"
                    f"- **Tác giả**: {b['author']}\n"
                    f"- **Thể loại**: {b['categoryName']}\n"
                    f"- **Năm xuất bản**: {b['publishYear']} ({b['publisher']})\n"
                    f"- **Vị trí lưu kho**: Kệ `{b['location']}`\n"
                    f"- **Số lượng khả dụng**: **{b['availableCopies']}/{b['totalCopies']}** cuốn\n"
                    f"- **Tóm tắt nội dung**: {b['description']}\n\n"
                    f"{'✅ Sách đang sẵn sàng cho mượn tại quầy thủ thư.' if b['availableCopies'] > 0 else '❌ Hiện tại sách đã được mượn hết. Vui lòng liên hệ thủ thư để đặt trước.'}"
                )

        # General intelligent response
        return (
            f"Chào bạn! Tôi là **Trợ lý AI Thư viện** (Đề tài Lab 02 - Phan Văn Quân - 29214663437).\n\n"
            f"Tôi có thể hỗ trợ bạn:\n"
            f"1. **Tìm kiếm & Gợi ý sách** theo chủ đề (ví dụ: *'Gợi ý sách về AI'*, *'Sách lập trình web'*, *'Sách khởi nghiệp'*).\n"
            f"2. **Tra cứu quy định** mượn/trả, gia hạn sách và phí quá hạn.\n"
            f"3. **Tóm tắt nội dung** và kiểm tra vị trí kệ của bất kỳ đầu sách nào trong kho.\n\n"
            f"Bạn có thể nhập câu hỏi cụ thể hoặc dán Gemini API Key từ Google AI Studio để kích hoạt mô hình sinh nâng cao!"
        )

ai_assistant = LibraryAIAssistant()
