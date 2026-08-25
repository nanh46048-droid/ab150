const express = require('express');
const path = require('path');
const cors = require('cors');
const quizRouter = require('./routes/quiz');
const courseRouter = require('./routes/course');
const generateRouter = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: '*', // hoặc 'https://ab150-2.onrender.com'
  credentials: true
}));
app.use(express.json());

app.use('/api/quiz', quizRouter);
app.use('/api/course', courseRouter);
app.use('/api/generate', generateRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Phục vụ giao diện frontend đã build tĩnh
app.use(express.static(path.join(__dirname, 'out'), { extensions: ['html'] }));

// Catch-all route để hỗ trợ client-side routing của React/Next.js
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out/index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ EduSmart API running at http://localhost:${PORT}`);
});
