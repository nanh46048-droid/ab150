const express = require('express');
const cors = require('cors');
const quizRouter = require('./routes/quiz');
const courseRouter = require('./routes/course');
const generateRouter = require('./routes/generate');

const app = express();
const PORT = 4000;

app.use(cors({
  origin: '*', // hoặc 'https://ab150-2.onrender.com'
  credentials: true
}));
app.use(express.json());

app.use('/api/quiz', quizRouter);
app.use('/api/course', courseRouter);
app.use('/api/generate', generateRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.listen(PORT, () => {
  console.log(`✅ EduSmart API running at http://localhost:${PORT}`);
});
