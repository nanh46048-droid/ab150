const express = require('express');
const router = express.Router();
const multer = require('multer');
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix { constructor() {} };
}
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

// Multer setup cho việc upload file vào bộ nhớ
const upload = multer({ storage: multer.memoryStorage() });

// Khởi tạo Gemini SDK (Sẽ được gọi trực tiếp trong hàm khi có API KEY)


const dataPath = path.join(__dirname, '../data/dynamicQuestions.json');

// Hàm đọc dữ liệu câu hỏi hiện tại
const getQuizData = () => {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { chapters: [], questions: [] };
  }
};

// Hàm lưu dữ liệu
const saveQuizData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Route: POST /api/generate
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const questionCount = parseInt(req.body.count) || 10;
    
    if (!file) {
      return res.status(400).json({ error: 'Vui lòng chọn một file tài liệu' });
    }

    let isMockMode = false;
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      console.log('Chạy ở chế độ MOCK (không dùng API thật vì thiếu key)');
      isMockMode = true;
    }

    // 1. Trích xuất text từ file
    let extractedText = '';
    const utf8Name = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const ext = path.extname(utf8Name).toLowerCase();
    
    if (ext === '.pdf') {
      const pdfData = await pdfParse(file.buffer);
      extractedText = pdfData.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value;
    } else if (ext === '.txt') {
      extractedText = file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Chỉ hỗ trợ file PDF, DOCX, hoặc TXT' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'Không thể trích xuất văn bản từ file hoặc file rỗng' });
    }

    // Giới hạn text để tránh quá tải API
    const maxChars = 30000;
    if (extractedText.length > maxChars) {
      extractedText = extractedText.substring(0, maxChars);
    }

    // 2. Gọi Claude API để tạo câu hỏi
    const prompt = `Bạn là một chuyên gia ra đề thi trắc nghiệm. Dựa vào nội dung tài liệu sau đây, hãy tạo ${questionCount} câu hỏi trắc nghiệm 4 lựa chọn.
Yêu cầu:
- Format trả về PHẢI là một mảng JSON các object. KHÔNG CÓ TEXT GÌ KHÁC NGOÀI JSON.
- Mỗi câu hỏi có các trường: "topic" (chủ đề ngắn của câu), "content" (nội dung câu hỏi), "options" (mảng gồm 4 lựa chọn, mỗi lựa chọn có "id" là "A", "B", "C", "D" và "text"), "correctAnswer" ("A", "B", "C", hoặc "D"), và "explanation" (giải thích chi tiết căn cứ vào Điều/Khoản nào).
- QUAN TRỌNG: Các đáp án (options) trong cùng một câu hỏi phải có độ dài tương đương nhau (lý tưởng là độ dài bằng nhau), và chỉ khác nhau ở một vài từ khóa quan trọng. Điều này giúp tránh việc người học dễ dàng đoán được đáp án dựa vào độ dài.
- QUAN TRỌNG: Câu hỏi phải hỏi chi tiết về các Điều, Khoản trong tài liệu (Ví dụ: "Theo Điều 1, quy định về... là gì?", "Khoản 2 Điều 3 nêu rõ nội dung nào?"). Hãy bám sát văn phong pháp lý và hỏi tương tự như các câu hỏi luật chuẩn mực. Không hỏi chung chung.

Tài liệu:
"""
${extractedText}
"""`;

    let newQuestionsList = [];
    
    if (isMockMode) {
      // Giả lập trả về câu hỏi mẫu
      for (let i = 0; i < questionCount; i++) {
        newQuestionsList.push({
          topic: `Chủ đề mẫu ${i + 1}`,
          content: `Đây là câu hỏi mẫu số ${i + 1} được sinh ra tự động vì bạn chưa nhập API Key thật. File của bạn có chứa từ khóa: "${extractedText.substring(0, 30)}..."`,
          options: [
            { id: "A", text: "Đáp án mẫu A với độ dài vừa phải để kiểm tra" },
            { id: "B", text: "Đáp án mẫu B với độ dài vừa phải để kiểm tra" },
            { id: "C", text: "Đáp án mẫu C với độ dài vừa phải để kiểm tra" },
            { id: "D", text: "Đáp án mẫu D với độ dài vừa phải để kiểm tra" }
          ],
          correctAnswer: "A",
          explanation: "Vì đây là chế độ giả lập nên đáp án A luôn đúng."
        });
      }
    } else {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction: "Bạn là một hệ thống AI chỉ trả về JSON thuần túy, không có text markdown hay lời bình luận nào khác. Đầu ra của bạn phải parse được trực tiếp bằng JSON.parse().",
            temperature: 0.2
          }
        });

        let generatedJsonText = response.text;
        generatedJsonText = generatedJsonText.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
          newQuestionsList = JSON.parse(generatedJsonText);
        } catch (e) {
          console.error("Lỗi parse JSON từ Gemini:", generatedJsonText);
          return res.status(500).json({ error: 'AI trả về dữ liệu không hợp lệ (không phải JSON)' });
        }
      } catch (err) {
        console.error("Lỗi khi gọi Google Gemini API:", err);
        return res.status(500).json({ error: 'Lỗi khi gọi AI API' });
      }
    }

    // 3. Cập nhật vào dữ liệu hiện có thành một chapter mới
    const data = getQuizData();
    
    // Tìm ID chapter tiếp theo
    const nextChapterId = data.chapters.length > 0 
      ? Math.max(...data.chapters.map(c => c.id)) + 1 
      : 1;

    const newChapter = {
      id: nextChapterId,
      title: `Chương AI: ${utf8Name}`,
      subtitle: `Tạo lúc ${new Date().toLocaleTimeString()}`,
      color: '#10b981', // Màu xanh lá cho AI
      icon: '🤖',
      total: newQuestionsList.length
    };

    data.chapters.push(newChapter);

    // Tìm ID question tiếp theo
    let nextQuestionId = data.questions.length > 0
      ? Math.max(...data.questions.map(q => q.id)) + 1
      : 1;

    const formattedQuestions = newQuestionsList.map(q => {
      const qObj = {
        id: nextQuestionId++,
        chapterId: nextChapterId,
        chapterTitle: newChapter.title,
        topic: q.topic || 'Câu hỏi AI',
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      };
      return qObj;
    });

    data.questions.push(...formattedQuestions);

    // Ghi file
    saveQuizData(data);

    res.json({
      success: true,
      message: `Đã sinh thành công ${formattedQuestions.length} câu hỏi`,
      chapterId: nextChapterId
    });

  } catch (error) {
    console.error("Lỗi trong quá trình sinh câu hỏi:", error);
    res.status(500).json({ error: error.message || 'Có lỗi xảy ra khi xử lý file' });
  }
});

module.exports = router;
