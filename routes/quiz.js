const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/dynamicQuestions.json');

const getQuizData = () => {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { chapters: [], questions: [] };
  }
};

// GET /api/quiz/chapters — danh sách chương
router.get('/chapters', (req, res) => {
  const { chapters, questions } = getQuizData();
  const chaptersWithCount = chapters.map((ch) => ({
    ...ch,
    questionCount: questions.filter((q) => q.chapterId === ch.id).length,
  }));
  res.json(chaptersWithCount);
});

// GET /api/quiz — danh sách câu hỏi (không có correctAnswer)
router.get('/', (req, res) => {
  const { chapter, limit, offset } = req.query;
  let { questions } = getQuizData();
  
  if (chapter) {
    questions = questions.filter((q) => q.chapterId === parseInt(chapter));
  }
  const total = questions.length;
  const start = parseInt(offset) || 0;
  const end = limit ? start + parseInt(limit) : questions.length;
  const paginated = questions.slice(start, end).map(({ correctAnswer, explanation, ...rest }) => rest);
  res.json({ total, questions: paginated });
});

// GET /api/quiz/:id — câu hỏi theo id (có correctAnswer để client verify offline)
router.get('/:id', (req, res) => {
  const { questions } = getQuizData();
  const q = questions.find((q) => q.id === parseInt(req.params.id));
  if (!q) return res.status(404).json({ error: 'Question not found' });
  // Không trả explanation, client tự hiển thị sau khi submit
  const { explanation, ...rest } = q;
  res.json(rest);
});

// POST /api/quiz/:id/submit — nộp đáp án
router.post('/:id/submit', (req, res) => {
  const { questions } = getQuizData();
  const q = questions.find((q) => q.id === parseInt(req.params.id));
  if (!q) return res.status(404).json({ error: 'Question not found' });
  const { answer } = req.body;
  const correct = answer === q.correctAnswer;
  res.json({
    correct,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  });
});

// DELETE /api/quiz/chapters/:id — Xóa chương
router.delete('/chapters/:id', (req, res) => {
  let data = getQuizData();
  const chapterId = parseInt(req.params.id);
  
  data.chapters = data.chapters.filter(c => c.id !== chapterId);
  data.questions = data.questions.filter(q => q.chapterId !== chapterId);
  
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

module.exports = router;

